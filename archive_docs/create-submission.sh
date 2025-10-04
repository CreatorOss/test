#!/bin/bash

# create-submission.sh
# Script to create submission archive for Qodo.ai Competition
# Author: Benny Harianto (creatoropensource@gmail.com)

echo "🎯 Creating Qodo.ai Competition Submission Archive..."
echo "Developer: Benny Harianto"
echo "Email: creatoropensource@gmail.com"
echo "Project: Final Sendec System"
echo ""

# Set variables
PROJECT_NAME="sendec-server"
SUBMISSION_NAME="sendec-server-qodo-competition-benny-harianto"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="${SUBMISSION_NAME}_${TIMESTAMP}"

# Create temporary directory for clean submission
TEMP_DIR="/tmp/${ARCHIVE_NAME}"
echo "📁 Creating temporary directory: ${TEMP_DIR}"
mkdir -p "${TEMP_DIR}"

# Copy project files (excluding unnecessary files)
echo "📋 Copying project files..."
cp -r . "${TEMP_DIR}/"

# Remove unnecessary files
echo "🧹 Removing unnecessary files..."
rm -rf "${TEMP_DIR}/node_modules" 2>/dev/null || true
rm -rf "${TEMP_DIR}/.git" 2>/dev/null || true
rm -rf "${TEMP_DIR}/keys" 2>/dev/null || true
rm -f "${TEMP_DIR}"/*.log 2>/dev/null || true
rm -f "${TEMP_DIR}"/*.tmp 2>/dev/null || true
rm -f "${TEMP_DIR}"/.DS_Store 2>/dev/null || true
rm -f "${TEMP_DIR}"/Thumbs.db 2>/dev/null || true

# Add submission metadata
echo "📝 Adding submission metadata..."
cat > "${TEMP_DIR}/SUBMISSION_INFO.txt" << EOF
=================================================================
QODO.AI COMPETITION SUBMISSION
=================================================================

Project: Final Sendec System
Description: Multi-AI Quorum Security Platform with Democratic Decision Making

Developer Information:
- Name: Benny Harianto
- Email: creatoropensource@gmail.com
- LinkedIn: https://www.linkedin.com/in/bennyharianto-024868383
- GitHub: https://github.com/CreatorOss

Submission Details:
- Date: $(date)
- Version: 1.0.0
- Archive: ${ARCHIVE_NAME}

Quick Start:
1. Extract archive
2. cd ${PROJECT_NAME}
3. npm install
4. npm start
5. Open final-sendec-client.html in browser

Demo URL: http://127.0.0.1:6000/status
Main Interface: final-sendec-client.html

Features:
- 7 Microservices Architecture
- 3 AI Nodes with Democratic Voting
- Shamir Secret Sharing (3/5 threshold)
- AES-256-GCM Encryption
- Real-time Monitoring
- Interactive Demo Interface
- Self-Destruct Protocol
- 100% Test Coverage (17/17 tests)

=================================================================
EOF

# Create ZIP archive
echo "📦 Creating ZIP archive..."
cd /tmp
zip -r "${ARCHIVE_NAME}.zip" "${ARCHIVE_NAME}/" -x "*.DS_Store" "*/Thumbs.db"

# Create TAR.GZ archive
echo "📦 Creating TAR.GZ archive..."
tar -czf "${ARCHIVE_NAME}.tar.gz" "${ARCHIVE_NAME}/"

# Move archives to original directory
echo "📁 Moving archives to project directory..."
mv "${ARCHIVE_NAME}.zip" "/root/dragon/global/"
mv "${ARCHIVE_NAME}.tar.gz" "/root/dragon/global/"

# Calculate file sizes
ZIP_SIZE=$(du -h "/root/dragon/global/${ARCHIVE_NAME}.zip" | cut -f1)
TAR_SIZE=$(du -h "/root/dragon/global/${ARCHIVE_NAME}.tar.gz" | cut -f1)

# Clean up temporary directory
echo "🧹 Cleaning up temporary files..."
rm -rf "${TEMP_DIR}"

# Display results
echo ""
echo "✅ SUBMISSION ARCHIVES CREATED SUCCESSFULLY!"
echo "================================================"
echo "📦 ZIP Archive: ${ARCHIVE_NAME}.zip (${ZIP_SIZE})"
echo "📦 TAR.GZ Archive: ${ARCHIVE_NAME}.tar.gz (${TAR_SIZE})"
echo "📁 Location: /root/dragon/global/"
echo ""
echo "🎯 READY FOR QODO.AI COMPETITION SUBMISSION!"
echo ""
echo "📧 Submission Options:"
echo "1. Email attachment (recommended for ZIP < 25MB)"
echo "2. Google Drive / Dropbox share link"
echo "3. GitHub repository: https://github.com/CreatorOss/sendec-server"
echo "4. Competition platform upload"
echo ""
echo "📞 Contact: creatoropensource@gmail.com"
echo "🔗 LinkedIn: https://www.linkedin.com/in/bennyharianto-024868383"
echo ""
echo "🏆 Good luck in the competition!"