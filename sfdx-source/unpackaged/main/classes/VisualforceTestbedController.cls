public class VisualforceTestbedController {

    public string canExecuteMethod1 {get; set;}
    public string canExecuteMethod2 {get; set;}
    public string canExecuteMethod3 {get; set;}

    public string method1DebugOutput {get; set;}
    public string method2DebugOutput {get; set;}
    public string method3DebugOutput {get; set;}

    public string method1ExecutionResultColor {get; set;}
    public string method2ExecutionResultColor {get; set;}
    public string method3ExecutionResultColor {get; set;}
    
    string executionSuccess = 'Execution Successful';
    string executionFailure = 'Execution Failed';
    
    string executionSuccessColor = 'DarkGreen';
    string executionFailureColor = 'DarkRed';


    Public PageReference executeMethod1() {
        if (true) {
            canExecuteMethod1 = executionSuccess;
            method1ExecutionResultColor = executionSuccessColor;
        } else {
            canExecuteMethod1 = executionFailure;
            method1ExecutionResultColor = executionFailureColor;
        }
        return Page.VisualforceTestbed;
    }
    
    Public PageReference executeMethod2() {
        if (true) {
            canExecuteMethod2 = executionSuccess;
            method2ExecutionResultColor = executionSuccessColor;
        } else {
            canExecuteMethod2 = executionFailure;
            method2ExecutionResultColor = executionFailureColor;
        }
        return Page.VisualforceTestbed;
    }

    Public PageReference executeMethod3() {
        if (true) {
            canExecuteMethod3 = executionSuccess;
            method3ExecutionResultColor = executionSuccessColor;
        } else {
            canExecuteMethod3 = executionFailure;
            method3ExecutionResultColor = executionFailureColor;
        }
        return Page.VisualforceTestbed;
    }
}