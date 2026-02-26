@echo off
setlocal enabledelayedexpansion

echo Creating src directory structure...

:: Root
if not exist src mkdir src

:: Folders
for %%d in (
    src\context
    src\hooks
    src\services
    src\utils
    src\components
    src\components\layout
    src\components\ui
    src\components\shared
    src\pages
    src\pages\auth
    src\pages\superadmin
    src\pages\admin
    src\pages\waiter
    src\pages\kitchen
    src\pages\cashier
) do (
    if not exist "%%d" mkdir "%%d"
)

:: Files
call :createFile src\main.jsx
call :createFile src\App.jsx

call :createFile src\context\AuthContext.jsx
call :createFile src\context\ToastContext.jsx

call :createFile src\hooks\usePolling.js
call :createFile src\hooks\useApi.js
call :createFile src\hooks\usePlanLimits.js

call :createFile src\services\api.js

call :createFile src\utils\auth.js
call :createFile src\utils\formatters.js
call :createFile src\utils\constants.js

call :createFile src\components\layout\AppLayout.jsx
call :createFile src\components\layout\Sidebar.jsx
call :createFile src\components\layout\TopBar.jsx

call :createFile src\components\ui\Button.jsx
call :createFile src\components\ui\Input.jsx
call :createFile src\components\ui\Modal.jsx
call :createFile src\components\ui\Table.jsx
call :createFile src\components\ui\Badge.jsx
call :createFile src\components\ui\Card.jsx
call :createFile src\components\ui\Spinner.jsx
call :createFile src\components\ui\Toast.jsx
call :createFile src\components\ui\ConfirmDialog.jsx

call :createFile src\components\shared\PlanLimitBanner.jsx
call :createFile src\components\shared\ErrorBoundary.jsx

call :createFile src\pages\auth\Login.jsx
call :createFile src\pages\auth\Register.jsx

call :createFile src\pages\superadmin\SuperDashboard.jsx
call :createFile src\pages\superadmin\Restaurants.jsx
call :createFile src\pages\superadmin\RestaurantDetail.jsx
call :createFile src\pages\superadmin\ActivityLogs.jsx

call :createFile src\pages\admin\AdminDashboard.jsx
call :createFile src\pages\admin\ManageStaff.jsx
call :createFile src\pages\admin\ManageTables.jsx
call :createFile src\pages\admin\ManageMenu.jsx
call :createFile src\pages\admin\ManageInventory.jsx
call :createFile src\pages\admin\Reports.jsx

call :createFile src\pages\waiter\WaiterDashboard.jsx
call :createFile src\pages\waiter\CreateOrder.jsx

call :createFile src\pages\kitchen\KitchenBoard.jsx

call :createFile src\pages\cashier\BillingPanel.jsx

echo Done.
pause
exit /b

:createFile
if not exist "%1" (
    type nul > "%1"
    echo Created %1
) else (
    echo Skipped %1 (already exists)
)
exit /b