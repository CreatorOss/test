#!/bin/bash
set -e

echo "🧹 Membersihkan folder sendec-server..."

# Buat folder arsip untuk file non-runtime
mkdir -p archive_docs

# Pindahkan semua dokumen markdown & report
mv *.md archive_docs/ 2>/dev/null || true
mv *REPORT*.md archive_docs/ 2>/dev/null || true
mv *SUMMARY*.md archive_docs/ 2>/dev/null || true
mv *GUIDE*.md archive_docs/ 2>/dev/null || true
mv *INSTRUCTIONS*.md archive_docs/ 2>/dev/null || true
mv *DEMO*.md archive_docs/ 2>/dev/null || true

# Pindahkan helper script dan submission content
mv create-submission.sh archive_docs/ 2>/dev/null || true
mv submission-helper.sh archive_docs/ 2>/dev/null || true
mv github-prep.sh archive_docs/ 2>/dev/null || true
mv submission-content archive_docs/ 2>/dev/null || true

# Pindahkan file hasil testing/laporan
mv test-report.json archive_docs/ 2>/dev/null || true
mv coordinator.js archive_docs/ 2>/dev/null || true

echo "✅ Cleanup selesai!"
echo "Runtime core Sendec sekarang hanya berisi file inti untuk demo."
echo "Semua file non-runtime ada di folder archive_docs/"
