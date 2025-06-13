const HealthRecord = require('../models/healthRecord.model');
const User = require('../models/user.model');
const HealthRecordService = require('../services/healthRecord.service');
const EncryptionService = require('../services/encryption.service');
const IPFSService = require('../services/ipfs.service');
const HederaService = require('../services/hedera.service');  // Add this line

exports.submitRecord = async (req, res) => {
    try {
        const recordData = req.body;

        // 1. Find patient by email
        const patient = await User.findOne({ email: recordData.patientId });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found. Please verify the patient email.'
            });
        }

        // 2. Generate hashed ID
        const patientIdHash = HealthRecordService.generatePatientIdHash(patient.email);

        // 3. Sanitize content input (ensure it's a JSON string)
        if (recordData.content && typeof recordData.content === 'object') {
            recordData.content = JSON.stringify(recordData.content);
        }

        // 4. Validate input structure
        HealthRecordService.validateHealthRecord(recordData);

        // 5. Process and store data in IPFS
        const { publicData, ipfsHash } = await HealthRecordService.splitAndProcessData(recordData);

        // 6. Log to Hedera
        const hederaResponse = await HederaService.storeData({ ipfsHash, patientIdHash });

        const transactionDetails = {
            transactionId: hederaResponse?.transactionId || null,
            consensusTimestamp: hederaResponse?.consensusTimestamp?.toString() || null,
            topicSequenceNumber: hederaResponse?.topicSequenceNumber?.toString() || null,
            runningHash: hederaResponse?.topicRunningHash || null,
            status: hederaResponse?.status || null
        };
        // 7. Save health record in MongoDB
        const healthRecord = new HealthRecord({
            documentId: HealthRecordService.generateDocumentId(),
            patientIdHash: patientIdHash,
            metadata: {
                ...publicData.metadata,
                timestamp: Date.now(),
                version: '1.0',
                lastModified: new Date(),
                patientEmail: patient.email
            },
            storage: {

                ipfsHash,
                hedera: {
                    transactionId: transactionDetails.transactionId,
                    consensusTimestamp: transactionDetails.consensusTimestamp,
                    topicSequenceNumber: transactionDetails.topicSequenceNumber,
                    runningHash: transactionDetails.runningHash,
                    status: transactionDetails.status
                }
            },
            status: 'stored'
        });

        await healthRecord.save();

        // 8. Link record to user
        patient.healthRecords = patient.healthRecords || [];
        patient.healthRecords.push(healthRecord._id);
        await patient.save();

        return res.status(201).json({
            success: true,
            message: 'Health record submitted successfully',
            documentId: healthRecord.documentId,
            metadata: publicData.metadata
        });

    } catch (error) {
        console.error('Error submitting record:', error);
        return res.status(error.message.includes('limit') ? 413 : 500).json({
            success: false,
            message: 'Failed to submit health record',
            error: error.message
        });
    }
};


exports.getRecordById = async (req, res) => {
    const { id } = req.params;

    try {
        // Add ID validation
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid record ID format'
            });
        }

        const record = await HealthRecord.findById(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Health record not found'
            });
        }

        // Return public data with metadata and patientIdHash
        return res.status(200).json({
            success: true,
            record: {
                documentId: record.documentId,
                patientIdHash: record.patientIdHash,  // Added this line
                metadata: {
                    provider: record.metadata.provider,
                    facility: record.metadata.facility,
                    timestamp: record.metadata.timestamp,
                },
                status: record.status
            }
        });
    } catch (error) {
        console.error('Error fetching record:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch health record',
            error: error.message
        });
    }
};



// Also add a method to get record by patientIdHash
exports.getRecordsByPatientId = async (req, res) => {
    try {
        const { patientId } = req.params;
        const hashedPatientId = HealthRecordService._hashPatientId(patientId);

        const records = await HealthRecord.find({ patientIdHash: hashedPatientId });

        return res.status(200).json({
            success: true,
            records: records.map(record => ({
                documentId: record.documentId,
                patientIdHash: record.patientIdHash,
                metadata: record.metadata,
                status: record.status
            }))
        });
    } catch (error) {
        console.error('Error fetching records by patient ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch health records',
            error: error.message
        });
    }
};

exports.getRecordContent = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid record ID format'
            });
        }

        // Find record in MongoDB
        const record = await HealthRecord.findById(id);
        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Health record not found'
            });
        }

        // Get encrypted content from IPFS and decrypt it
        const decryptedContent = await IPFSService.getEncryptedContent(
            record.storage.ipfsHash,
            record.storage.encryptionKey
        );

        return res.status(200).json({
            success: true,
            content: decryptedContent
        });
    } catch (error) {
        console.error('Error fetching record content:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch record content',
            error: error.message
        });
    }
};
