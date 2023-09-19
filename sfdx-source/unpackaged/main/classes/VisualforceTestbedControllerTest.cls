@isTest
public class VisualforceTestbedControllerTest {

    static string executionSuccess = 'Execution Successful';

    @isTest
    static void testExecutionMethod1() {
        VisualforceTestbedController vfTestbedCtrl = new VisualforceTestbedController();
        vfTestbedCtrl.executeMethod1();
        
        System.assertEquals(vfTestbedCtrl.canExecuteMethod1, executionSuccess);
    }
    
    @isTest
    static void testExecutionMethod2() {
        VisualforceTestbedController vfTestbedCtrl = new VisualforceTestbedController();
        vfTestbedCtrl.executeMethod2();
        
        System.assertEquals(vfTestbedCtrl.canExecuteMethod2, executionSuccess);
    }
    
    @isTest
    static void testExecutionMethod3() {
        VisualforceTestbedController vfTestbedCtrl = new VisualforceTestbedController();
        vfTestbedCtrl.executeMethod3();
        
        System.assertEquals(vfTestbedCtrl.canExecuteMethod3, executionSuccess);
    }
    
}