const express = require('express');
const router = express.Router();
const HealthRecordController = require('../controllers/healthRecord.controller');
const ipfsService = require('../services/ipfs.service');

// Submit new health record
router.post('/submit', HealthRecordController.submitRecord);
/**
 * Submit health record API
 * POST http://localhost:3000/api/health-records/submit
 * 
 * Request body:
 * {
 *   "patientId": "patient123",
 *   "content": "Patient consultation notes...",
 *   "metadata": {
 *     "provider": "Dr. Smith",
 *     "facility": "General Hospital"
 *   }
 * }
 */

// Test IPFS upload route
router.post('/test/ipfs/upload', async (req, res) => {
  try {
    const cid = await ipfsService.uploadContent(req.body);
    res.json({ success: true, cid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test IPFS retrieve route
router.get('/test/ipfs/:cid', async (req, res) => {
  try {
    const content = await ipfsService.getContent(req.params.cid);
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//https://gateway.pinata.cloud/ipfs/{cid}

// Get record by ID
router.get('/:id', HealthRecordController.getRecordById);
/**
 * Get health record by ID API
 * GET http://localhost:3000/api/health-records/:id
 * 
 * Parameters:
 * - id: MongoDB _id of the health record
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "record": {
 *     "documentId": "...",
 *     "patientIdHash": "...",
 *     "metadata": {...},
 *     "status": "..."
 *   }
 * }
 */

/**
 * Metadata response example:
 * {
 *   "success": true,
 *   "metadata": {                    // Only metadata
 *     "provider": "Dr. Smith",
 *     "facility": "General Hospital",
 *     "date": "2023-10-10"
 *   }
 * }
 * 
 * Full record response example:
 * {
 *   "success": true,
 *   "record": {                      // Complete record object
 *     "documentId": "...",           // Additional fields
 *     "patientIdHash": "...",        // Additional fields
 *     "metadata": {...},             // Includes metadata
 *     "status": "..."                // Additional fields
 *   }
 * }
 */

// Test verification route
router.get('/verify/:id', async (req, res) => {
  try {
    // Get record from database
    const record = await HealthRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Get content from IPFS
    const ipfsContent = await ipfsService.getContent(record.storage.ipfsHash);

    return res.json({
      success: true,
      record: {
        documentId: record.documentId,
        ipfsHash: record.storage.ipfsHash,
        databaseContent: record.storage.encryptedData,
        ipfsContent: ipfsContent,
        verified: JSON.stringify(record.storage.encryptedData) === JSON.stringify(ipfsContent)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new route for getting private content
router.get('/:id/private', HealthRecordController.getPrivateContent);
/**
 * Get private health record content API
 * GET http://localhost:3000/api/health-records/:id/private
 * 
 * Parameters:
 * - id: MongoDB _id of the health record
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "privateContent": {
 *     "patientId": "...",
 *     "content": "...",
 *     "fullMetadata": {...}
 *   }
 * }
 */

module.exports = router;
