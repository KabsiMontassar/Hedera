const express = require('express');
const router = express.Router();
const HealthRecordController = require('../controllers/healthRecord.controller');

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

// Add new route to get records by patient ID
router.get('/patient/:patientId', HealthRecordController.getRecordsByPatientId);
/**
 * Get health records by patient ID API
 * GET http://localhost:3000/api/health-records/patient/:patientId
 * 
 * Parameters:
 * - patientId: Original patient ID
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "records": [{
 *     "documentId": "...",
 *     "patientIdHash": "...",
 *     "metadata": {...},
 *     "status": "..."
 *   }]
 * }
 */

// Get IPFS content
router.get('/content/:id', HealthRecordController.getRecordContent);
/**
 * Get health record content from IPFS
 * GET http://localhost:3000/api/health-records/content/:id
 * 
 * Parameters:
 * - id: MongoDB _id of the health record
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "content": {
 *     // Decrypted record content
 *   }
 * }
 */

module.exports = router;
