export class AppConstants {
    public static debug = 0; // if set debug flag to 0. no console log print
    public static TIMEOUT_WARNING = [15, 5];
    public static DATA_INTERVAL =  5;
    public static SUCCESS_RESPONSE = "success";
    public static FAILURE_RESPONSE = "failure";
    public static USER_ROLE_ADMIN = 'admin';
    public static SETUP_STATUS_COMPLETE = 'COMPLETE';
    public static SETUP_STATUS_NOT_STARTED = 'NOT_STARTED';
    public static SETUP_STATUS_IN_PROGRESS = 'IN_PROGRESS';
    public static SETUP_STATUS_ACCOUNTING_TYPE_CHOSEN = 'ACCOUNTING_TYPE_CHOSEN';


    public static EC_CONTACT_NO_DATA = "No Contacts";

    //Account Type
    public static QBO_ACCOUNT_TYPE = 'QBO';
    public static QBD_ACCOUNT_TYPE = 'QBD';
    public static CSV_ACCOUNT_TYPE = 'CSV';
    public static MANUAL_ACCOUNT_TYPE = 'MANUAL';
    public static XERO_ACCOUNT_TYPE = 'XERO';
    public static SECURITY_ISSUER = 'Espresso%20Capital';



    public static QUICKBOOKS = 'quickbooks';
    public static XERO = 'xero';
    public static SAGE = 'sage';
    public static DATE_FORMAT = 'YYYY-MM-DD';
}

export class LoadingMessage {

    public static LOGIN_AUTHENTICATION = "Login Authentication";
    public static COMPANY_META_SETUP = "Company meta setup";
    public static UPDATE_COMPANY_META = "Company meta setup update";
    public static GET_COMPANY_META = "Get company meta";
    public static UNAUTHORIZED_ACCESS = 'Unauthorized Access';


    public static CHANGE_SAVED_TEXT = 'Your changes has been saved';

    public static MATCH_COA = 'Matching your Chart of Accounts';
    public static UPLOADING_COA = "Uploading your Chart of Accounts";
    public static UPLOADING_TB = "Uploading your Trial Balance";
    public static LOADING_TB = "Loading your Trial Balance";
    public static SAVE_COA_MATCHINGS = "Saving your Chart of Accounts Matching";
    public static PROCESSING_FINANCIALS = "Processing your Financials. Hang tight, this can take up to 20 seconds";
    public static NOCHANAGE_IN_COA_TB_IS_LOADING = 'No change in Chart of Accounts. Loading your Trial Balance';
    public static NOCHANAGE_IN_COA_AND_MAPPIN_IS_LOADING = 'No change in Chart of Accounts. Loading your CoA Mappings';
    public static LOADING_GENERATE_STATEMENTS = "Processing generated statements.";
    public static COA_MAPPIN_IS_LOADING = 'Loading your CoA Mappings';
    public static PASSWORD_CHANGE_SUCCESS = 'Password changed successfully. re-login again';

    public static FINANCIAL_OVERVIEW = 'Loading your Financial Overview';
    public static ESPRESSO_CONTACT = "Espresso Contact"
    public static GET_INCOME_STATEMENT = 'Get Income Statement';
    public static GET_BALANCE_SHEET = 'Get Balance Sheet';
    public static GET_INCOME_CERTIFICATE = 'Get Income Certificate';
    public static GET_INCOME_AND_BALANCE_SHEET = 'get income and balance sheet';
    public static LOAD_BALANCE_AND_INCOME_FOR_MOMENT = 'Loading your Balance Sheet and Income Statement for ';

    public static INCOME_CERTIFICATE_FOR_PARTICULAR_MONTH = 'Get Income Cetificate For Particular Month';
    public static BALANCE_SHEET_CERTIFICATE_FOR_PARTICULAR_MONTH = 'Get Balance Sheet For Particular Month';

    public static SEND_INCOME_STATEMENT = 'Send Income Statement';
    public static SEND_BALANCE_SHEET = 'Send Balance Sheet';
    public static TFA_AUTH_DISABLED_SUCCESS = 'Two factor Authentication disabled successfully';

    public static START_REPORT = 'Starting Monthly Report for ';
    public static CONTINUE_REPORT = 'Continuing Monthly Report for ';
    public static LOADING_PREVIOUS_REPORT = 'Loading Previous Report';
    public static GET_COMPANY_BY_SEARCH = 'Get Company By Search';
    public static GET_COMPANY_LIST = 'Get Company List';
    public static GET_COMPANY_META_BY_COMPANY = 'Get Company Meta By Company';
    public static GET_MONTHLY_REPORT_BY_COMPANY = 'Get Monthly Report By Company';
    public static GET_MONTHLY_REPORT = 'Get Monthly Report';
    public static CREATE_MONTHLY_REPORT_FOR_CURRENT_PERIOD = 'Create Monthly Report For Current Period';
    public static GET_MONTHLY_REPORT_ANSWERS_BY_PERIOD = 'Get Monthly Report Answers By Period';

    public static SIGNING_OFF = 'signing off';
    public static SIGNING_OFF_INFO = 'Get signing off';
    public static GET_LAST_MONTH_REPORT_ANSWER = ' Get Last Month Report Answer';
    public static GET_QUESTION_LIST = 'Get Question List';
    public static SUBMIT_REPORTING_ANSWER = 'Submit Reporting Answers';
    public static SAVE_CHANGES_SUCCESS = 'Your changes has been saved';
    public static CONFIGURATION_2FA_SUCCESS = 'Two factor Authentication enabled successfully.';
}

export class NavigateToScreen{
    public static login = '/login';
    public static intro = '/intro';
    public static sync = '/sync';
    public static dashboard = '/dashboard';
    public static admin_company_search_component = 'AdminCompanySerachComponent';
    public static change_password = '/change_password';
    public static account_security = '/account-security';
    public static forgotpass = '/forgotpassword';

    public static qbo = '/connect/?company=';
    public static qbd = 'quickbook-desktop';
    public static csv = 'csv-upload';
    public static manual = 'form-entry';

    public static coa_match = 'coa-match';
    public static upload = 'upload';
    public static coa_match_confimation = 'coa-match-confirm';

    public static thanks = 'thanks';
    public static reporting = 'reporting';
    public static form_entry = 'form-entry';
    public static admin_previous_report = 'admin-previous-report';
    public static admin_previous_report_detail = 'admin-previous-report-detail';
    public static signoff = 'signoff';
    public static dashboard_previous_report = 'dashboard-prev-report';
    public static dashboard_signoff_prev_report = 'dashboard-signoff-prev-report';
}

export class ErrorCodes {
    public static TOKEN_EXPIRED = 400;
    public static INVALID_CREDENTIALS = 1000;
    public static VALIDATION_FAILED = 1001;
    public static DATA_PARSHING_ISSUE = 1004;
    public static INTERNAL_SERVER_ERROR = 1007;
    public static OBJECT_RESOURCE = 1008;
    public static NO_DATA_CHANGES = 1009;
    public static DATA_NOT_FOUND = 1006;
    public static MULTIPLE_MAIL = 1012;
    public static MAIL_NOT_FOUND = 1013;
    public static USER_COMPANY = 1014;
    public static FISCAL_YEAR_MISSING = 1015;
    public static XERO_CONNECTION_ERROR = 1016;


    public static MISSING_MONTHLY_REPORTING_PREVIOUS_PERIOD = 1105;
    public static MISSING_META_CURRENT_PERIOD = 1100;
    public static INVALID_COA_CSV = 1106;
    public static INVALID_TB_CSV = 1107;
    public static INVALID_TB_DATE = 1108;
    public static INVALID_FILE_FORMAT = 1103;
    public static SESSION_EXPIRED = 1200;
    public static SESSION_EXISTS = 1201;
    public static NO_META_DATA = 1300;
}

export class ErrorMessage {
    public static INVALID_CREDENTIALS = "Unable to login with required credentials.";
    public static USER_COMPANY = 'Your account is not valid. Please contact the admin for support.';
    public static DATA_PARSHING_ISSUE = "Data parsing has an issue. Please verify the data and parse again.";
    public static INTERNAL_SERVER_ERROR = "The server could not process the request.";
    public static OBJECT_RESOURCE_NOT_FOUND = "Object resource not found.";
    public static INVALID_SYNC_TYPE = "Invalid sync method.";
    public static MISSING_COMPANY_CONFIGURATION = 'Your accounting configuration is not valid. Please contact the admin for support.';

    public static PASSWORD_POLICY_NOT_CONTAINS = 'Password must be in strong. Given password not matched for defined policy.';
    public static NUMERIC_PASSWORD = 'Your password can\'t be entirely numeric.';
    public static EMPTY_PASSWORD = 'Passwords cannot be empty';
    public static SAME_PASSWORD = 'Both the passwords must be same';
    public static PASSWORD_LENGTH = 'Your password must contain at least 8 characters.';
    public static INVALID_MAIL = 'Please Enter a valid Email Address';

    public static MAIL_NOT_FOUND = 'Your account not found';
    public static MISSING_META_CURRENT_PERIOD = "Monthly current reporting period not found. Your administrator has been notified and will be in touch as soon as possible to help fix the issue";
    public static NO_META_DATA = 'No company metadata found. Your administrator has been notified and will be in touch as soon as possible to help fix the issue';
    public static NO_CONNECTION = 'No connection established';
    public static COA_NOT_UPLOADED = "Required the chart of accounting csv file.";
    public static TB_NOT_UPLOADED = "Required the trial balance csv file.";
    public static FISCAL_YEAR_MISSING = "Fiscal year ends not configure as proper.";
    public static XERO_CONNECTION_ERROR = "Xero connection error.";

    public static NO_SYNC_SETUP = "Company Sync method does not setup as proper.";
    public static NO_PREVIOUS_MONTHLY_REPORT = "There is no monthly report has been generated previously";
    public static NO_DATA_CHANGES = "No Data changed.";
    public static DATA_NOT_FOUND = "No data available";
    public static MISSING_MONTHLY_REPORTING_PREVIOUS_PERIOD = "No monthly report available for current period";
    public static INVALID_COA_CSV = "Selected Chart of Accounts file format is not valid";
    public static INVALID_TB_CSV = "Selected Trail balance file format is not valid.";
    public static INVALID_TB_DATE = "Current period doesn't match in Trial balance";
    public static INVALID_FILE_FORMAT = "Invalid File Format";

    public static SIGNOFF_NAME_EMPTY_VALIDATION ="Name of person certifying statements cannot be empty\n";
    public static SIGNOFF_POSITION_EMPTY_VALIDATION ="Position of person certifying statements cannot be empty\n";
    public static DEBIT_CREDIT_UNEQUAL ="Total Assets are not equal to Total L & E. Please check your numbers and try again.";
    public static INCORRECT_TOTP = 'Code incorrect / expired';
}