
#!/bin/bash

# Prepare Copyright Deposit ZIP for Palavox

echo "Creating base directory structure..."

# Create base directory
mkdir -p Palavox_Copyright_Deposit_2025/source_code
mkdir -p Palavox_Copyright_Deposit_2025/instructional_content/translations
mkdir -p Palavox_Copyright_Deposit_2025/instructional_content/lesson_content
mkdir -p Palavox_Copyright_Deposit_2025/instructional_content/certification
mkdir -p Palavox_Copyright_Deposit_2025/screenshots

# Copy source code files
echo "Copying source code files..."
cp -r src Palavox_Copyright_Deposit_2025/source_code/
cp -r public Palavox_Copyright_Deposit_2025/source_code/
cp package.json Palavox_Copyright_Deposit_2025/source_code/
cp tsconfig.json Palavox_Copyright_Deposit_2025/source_code/
cp vite.config.ts Palavox_Copyright_Deposit_2025/source_code/

# Copy translations
echo "Copying translation files..."
cp -r src/translations/* Palavox_Copyright_Deposit_2025/instructional_content/translations/

# Copy lesson content
echo "Copying lesson content..."
cp -r src/components/lessons/data Palavox_Copyright_Deposit_2025/instructional_content/lesson_content/
cp -r src/components/vocabulary/data/flashcards Palavox_Copyright_Deposit_2025/instructional_content/lesson_content/

# Copy certification content
echo "Copying certification content..."
cp -r src/components/certificates Palavox_Copyright_Deposit_2025/instructional_content/certification/
cp -r src/components/certifications Palavox_Copyright_Deposit_2025/instructional_content/certification/

# Copy legal files
echo "Copying legal files..."
cp LICENSE.txt COPYRIGHT.md COPYRIGHT_REGISTRATION.md Palavox_Copyright_Deposit_2025/
cp src/utils/copyrightHeader.txt Palavox_Copyright_Deposit_2025/

# Create placeholder screenshots
echo "Creating placeholder screenshots..."
echo "1. Home Page" > Palavox_Copyright_Deposit_2025/screenshots/home.txt
echo "2. Practice Interface" > Palavox_Copyright_Deposit_2025/screenshots/practice.txt
echo "3. Voice Chat" > Palavox_Copyright_Deposit_2025/screenshots/voice-chat.txt
echo "4. Progress Dashboard" > Palavox_Copyright_Deposit_2025/screenshots/progress.txt

# Create context notes
echo "Creating context notes..."
cp instructional_content/context_notes.txt Palavox_Copyright_Deposit_2025/instructional_content/

# Create ZIP
echo "Creating final ZIP archive..."
zip -r Palavox_Copyright_Deposit_2025.zip Palavox_Copyright_Deposit_2025

# Make script executable
chmod +x prepare_copyright_deposit.sh

echo "Copyright deposit prepared successfully!"
