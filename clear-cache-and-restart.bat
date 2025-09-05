@echo off
echo Clearing browser cache and restarting development server...

echo.
echo Step 1: Stopping any running processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul

echo.
echo Step 2: Clearing npm cache...
npm cache clean --force

echo.
echo Step 3: Removing node_modules and reinstalling...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm install

echo.
echo Step 4: Building the project...
npm run build

echo.
echo Step 5: Starting development server...
npm start

echo.
echo Done! Please open your browser and press Ctrl+F5 to hard refresh the page.
echo This will clear the browser cache and show the updated version.
pause

