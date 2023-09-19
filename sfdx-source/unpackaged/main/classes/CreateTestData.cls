public class CreateTestData {
    /**
     * Creates data from the TestData.json static resource. This static
     * method is intended to be called ONCE from Anonymous Apex when a
     * Dev/QA scratch org is created.
     * 
     * @return `void`
     * ```
     * CreateTestData.AccountsWithContacts();
     * ```
     */
    public static void AccountsWithContacts() {
        // Fetch the TestData static resource and deserialize the contents.
        StaticResource sr = [SELECT Id, Body FROM StaticResource WHERE Name = 'TestData' LIMIT 1];
        Object jsonData = JSON.deserializeUntyped(sr.Body.toString());

        // Read the JSON Data into the Data Generator.
        DataGenerator.readJsonData(jsonData);

        // Create Parent Account records.
        DataGenerator.insertRecords('Account');

        // Create Child Account records.
        DataGenerator.insertRecords('Account');

        // Create Contact records.
        DataGenerator.insertRecords('Contact');
    }
}