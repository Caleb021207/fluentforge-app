
#!/bin/bash

# Prepare Copyright Deposit ZIP for Palavox

# Create base directory
mkdir -p Palavox_Copyright_Deposit_2025/source_code
mkdir -p Palavox_Copyright_Deposit_2025/instructional_content/translations
mkdir -p Palavox_Copyright_Deposit_2025/instructional_content/lesson_content
mkdir -p Palavox_Copyright_Deposit_2025/instructional_content/certification
mkdir -p Palavox_Copyright_Deposit_2025/screenshots

# Copy source code
cp -r src supabase public package.json Palavox_Copyright_Deposit_2025/source_code/

# Copy instructional content
cp -r src/translations/* Palavox_Copyright_Deposit_2025/instructional_content/translations/
cp -r src/lessons Palavox_Copyright_Deposit_2025/instructional_content/lesson_content/
cp -r src/components/certificates Palavox_Copyright_Deposit_2025/instructional_content/certification/

# Copy legal files
cp README.txt COPYRIGHT.md LICENSE.txt COPYRIGHT_REGISTRATION.md copyrightHeader.txt Palavox_Copyright_Deposit_2025/

# Create screenshots (placeholder)
echo "Screenshots would be captured here during actual process"

# Create ZIP
zip -r Palavox_Copyright_Deposit_2025.zip Palavox_Copyright_Deposit_2025

echo "Copyright deposit prepared successfully!"
chmod +x prepare_copyright_deposit.sh
