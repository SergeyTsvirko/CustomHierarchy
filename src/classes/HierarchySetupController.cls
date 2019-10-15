public with sharing class HierarchySetupController {
    static final List<String> EXCEPTIONS_LIST = new List<String>{'CreatedById', 'LastModifiedById', 'InsertedById',
            'CompanyAuthorizedById', 'ActivatedById'};
    static final String FIELD_NAME = 'Name';
    static final String IMAGE_TYPE = 'URL';
    static final String REFERENCE_TYPE = 'REFERENCE';

    @AuraEnabled
    public static String getObjectsMap() {
        FieldWrapper relatedObject;
        ObjectDataWrapper objectWrapper;
        Map<String, SObjectType> allObjects = Schema.getGlobalDescribe();
        List<ObjectDataWrapper> result = new List<ObjectDataWrapper>();

        if (allObjects.values() != null) {
            for (Schema.SObjectType obj : allObjects.values()) {
                Map<String, Schema.SObjectField> allFieldSObjects  = obj.getDescribe().fields.getMap();
                Schema.DescribeSObjectResult objResult = obj.getDescribe();
                objectWrapper = new ObjectDataWrapper();
                objectWrapper.name = objResult.getName();
                objectWrapper.label = objResult.getLabel();

                for (Schema.SObjectField field : allFieldSObjects.values()) {
                    relatedObject = new FieldWrapper();
                    if (!field.getDescribe().getReferenceTo().isEmpty()) {
                        if (!EXCEPTIONS_LIST.contains(field.getDescribe().getName())) {
                            relatedObject.name = field.getDescribe().getReferenceTo()[0].getDescribe().getName();
                            relatedObject.label = field.getDescribe().getReferenceTo()[0].getDescribe().getLabel();
                            relatedObject.targetObject = String.valueOf(field.getDescribe().getName());
                            if (objectWrapper.targetObject == null) {
                                List<FieldWrapper> listTargetObjects = new List<FieldWrapper>{relatedObject};
                                objectWrapper.targetObject = listTargetObjects;
                            } else {
                                objectWrapper.targetObject.add(relatedObject);
                            }
                        }
                    }
                }
                result.add(objectWrapper);
            }
        }
        result.sort();
        return JSON.serialize(result);
    }

    @AuraEnabled
    public static String getObjectName(String lookupField, String objectName) {
        Map<String, Schema.SObjectField> firstObjectFieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        String relatedObject = String.valueOf(firstObjectFieldMap.get(lookupField).getDescribe().getReferenceTo());
        Map<String, Schema.SObjectField> secondObjectFieldMap = Schema.getGlobalDescribe().get(relatedObject.substringBetween('(',')')).getDescribe().fields.getMap();
        Map<String, String> relatedFieldMap = new Map<String, String>();

        for (SObjectField field : secondObjectFieldMap.values()) {
            if (String.valueOf(field.getDescribe().getType()) == IMAGE_TYPE) {
                relatedFieldMap.put(field.getDescribe().getName(), String.valueOf(field.getDescribe().getLabel()));
            }
        }

        return JSON.serialize(relatedFieldMap);
    }

    @AuraEnabled
    public static String getFieldObjectMap(String parentRelationObject, String childRelationship, String objectName, String childRelationObject) {
        PicklistValue result = new PicklistValue();

        result.editParentFieldObjectList = getParentObjectFieldMap(parentRelationObject, childRelationship, objectName);
        result.editChildFieldObjectList = getChildObjectFieldMap(childRelationObject);

        return JSON.serialize(result);
    }

    static List<Map<String, String>> getParentObjectFieldMap(String parentRelationObject, String childRelationship, String objectName) {
        List<Map<String, String>> editParentFieldObjectList = new List<Map<String, String>>();

        Map<String, Schema.SObjectField> firstObjectFieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        Map<String, Object> childRelationshipMap = (Map<String, Object>) JSON.deserializeUntyped(childRelationship);
        List<Object> parentRelationObjectList = (List<Object>) JSON.deserializeUntyped(parentRelationObject);

        for (Object parent : parentRelationObjectList) {
            Map<String, Object> tempMap = (Map<String, Object>) parent;

            String objName = String.valueOf(firstObjectFieldMap.get(String.valueOf(childRelationshipMap.get(String.valueOf(tempMap.get('reference'))))).getDescribe().getReferenceTo()).substringBetween('(',')');
            Map<String, Schema.SObjectField> secondObjectFieldMap = Schema.getGlobalDescribe().get(objName).getDescribe().fields.getMap();

            Map<String, String> tempFieldNameMap = new Map<String, String>();
            for (SObjectField field : secondObjectFieldMap.values()) {
                tempFieldNameMap.put(field.getDescribe().getName(), String.valueOf(field.getDescribe().getLabel()));
            }

            editParentFieldObjectList.add(tempFieldNameMap);
        }

        return editParentFieldObjectList;
    }

    static List<List<String>> getChildObjectFieldMap(String childRelationObject) {
        List<List<String>> editChildFieldObjectList = new List<List<String>>();
        List<Object> childRelationObjectList = (List<Object>) JSON.deserializeUntyped(childRelationObject);

        for (Object childRelation : childRelationObjectList) {
            Map<String, Object> childRelationMap = (Map<String, Object>) childRelation;
            Map<String, Schema.SObjectField> currentObjectFieldMap = Schema.getGlobalDescribe().get(String.valueOf(childRelationMap.get('object'))).getDescribe().fields.getMap();
            List<String> fieldList = new List<String>();

            for (SObjectField field : currentObjectFieldMap.values()) {
                fieldList.add(String.valueOf(field));
            }

            editChildFieldObjectList.add(fieldList);
        }

        return editChildFieldObjectList;
    }

    @AuraEnabled
    public static String getObjectNameByRelatedField(String lookupField, String objectName, String childRelationship) {
        Map<String, Object> childRelationshipMap = (Map<String, Object>) JSON.deserializeUntyped(childRelationship);
        Map<String, String> fieldObjectNameMap = new Map<String, String>();
        Map<String, Schema.SObjectField> firstObjectFieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();

        for (String field : lookupField.split(',')) {
            if (childRelationshipMap.containsKey(field)) {
                fieldObjectNameMap.put(field, String.valueOf(firstObjectFieldMap.get(String.valueOf(childRelationshipMap.get(field))).getDescribe().getReferenceTo()).substringBetween('(',')'));
            }
        }

        return JSON.serialize(fieldObjectNameMap);
    }

    @AuraEnabled
    public static String getObjectMap(String lookupField, String objectName, String childRelationshipMap) {
        Map<String, Object> childRelMap = (Map<String, Object>) JSON.deserializeUntyped(childRelationshipMap);
        Map<String, Schema.SObjectField> firstObjectFieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        String relatedObject = String.valueOf(firstObjectFieldMap.get(String.valueOf(childRelMap.get(lookupField))).getDescribe().getReferenceTo());
        Map<String, Schema.SObjectField> secondObjectFieldMap = Schema.getGlobalDescribe().get(relatedObject.substringBetween('(',')')).getDescribe().fields.getMap();
        Map<String, String> relatedFieldMap = new Map<String, String>();

        for (SObjectField field : secondObjectFieldMap.values()) {
            relatedFieldMap.put(field.getDescribe().getName(), String.valueOf(field.getDescribe().getLabel()));
        }

        return JSON.serialize(relatedFieldMap);
    }

    @AuraEnabled
    public static String getFieldMapByObjectName(String objectName) {
        Map<String, Schema.SObjectField> currentObjectFieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        List<String> fieldList = new List<String>();

        for (SObjectField field : currentObjectFieldMap.values()) {
            fieldList.add(String.valueOf(field));
        }

        return JSON.serialize(fieldList);
    }

    @AuraEnabled
    public static String getFieldSet(String objectName) {
        CurrentFieldsWrapper currentFieldsObj = new CurrentFieldsWrapper();

        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        for (SObjectField field : fieldMap.values()) {
            if (String.valueOf(field.getDescribe().getType()) == IMAGE_TYPE) {
                currentFieldsObj.urlFieldsMap.put(field.getDescribe().getName(), String.valueOf(field.getDescribe().getLabel()));
            }

            if ((String.valueOf(field.getDescribe().getType()) == IMAGE_TYPE) || (String.valueOf(field.getDescribe().getType()) == REFERENCE_TYPE)) {
                currentFieldsObj.urlAndReferenceMap.put(field.getDescribe().getName(), String.valueOf(field.getDescribe().getLabel()));
            }

            if ((String.valueOf(field.getDescribe().getType()) == REFERENCE_TYPE)) {
                if (field.getDescribe().getRelationshipName() != null) {
                    currentFieldsObj.referenceMap.put(field.getDescribe().getRelationshipName(), String.valueOf(field.getDescribe().getLabel()));
                    currentFieldsObj.childRelationshipMap.put(field.getDescribe().getRelationshipName(), field.getDescribe().getName());
                }
            }

            currentFieldsObj.allFieldsMap.put(field.getDescribe().getName(), String.valueOf(field.getDescribe().getLabel()));
            currentFieldsObj.fieldTypeMap.put(field.getDescribe().getName(), String.valueOf(field.getDescribe().getType()));
        }
        return JSON.serialize(currentFieldsObj);
    }

    @AuraEnabled
    public static String getSettings(String settingId) {
        String result;
        List<HierarchySetting__c> hierarchySettingsList = [SELECT RelationWrapper__c, Name FROM HierarchySetting__c WHERE Id =: settingId];
        if (hierarchySettingsList != null && !hierarchySettingsList.isEmpty()) {
            SettingToEdit editResult = new SettingToEdit();
            editResult.Name = hierarchySettingsList[0].Name;
            editResult.RelationWrapper = (Map<String, Object>) JSON.deserializeUntyped(hierarchySettingsList[0].RelationWrapper__c);
            result = JSON.serialize(editResult);
        }
        return result;
    }

    @AuraEnabled
    public static String addSettings(String recordId, String fieldString, String wrapper, String settingName,
            String imageField, String objectFieldName, String parentRelationObject, String childRelationObject) {

        List<Object> parentRelationList = (List<Object>) JSON.deserializeUntyped(parentRelationObject);
        MainObjectWrapper settingWrapper = new MainObjectWrapper();

        if (parentRelationList != null && !parentRelationList.isEmpty()) {
            settingWrapper.parentRelationMap = (Map<String, Object>) parentRelationList[0];
        }

        settingWrapper.fieldString = getFieldString(fieldString.split(','), fieldString, imageField);
        settingWrapper.targetObject = getResultList(wrapper);
        settingWrapper.objectFieldName = objectFieldName;
        settingWrapper.imageField = imageField;
        settingWrapper.childRelationList = (List<Object>) JSON.deserializeUntyped(childRelationObject);

        HierarchySetting__c newHierSetting = new HierarchySetting__c();
        if (recordId != null) {
            update newHierSetting = new HierarchySetting__c(Id = recordId, Name = settingName, RelationWrapper__c = JSON.serialize(settingWrapper));
        } else {
            insert newHierSetting = new HierarchySetting__c(Name = settingName, RelationWrapper__c = JSON.serialize(settingWrapper));
        }

        return newHierSetting.RelationWrapper__c;
    }

    public static String getFieldString(List<String> fieldsList, String fieldString, String imageField) {
        if (imageField != null) {
            if (!fieldsList.contains(imageField)) {
                fieldString = fieldString + ',' + imageField;
            }
        }

        if (!fieldsList.contains(FIELD_NAME)) {
            fieldString = fieldString + ',' + FIELD_NAME;
        }

        return fieldString;
    }

    public static List<ObjectRelations> getResultList(String wrapper) {
        List<Object> wrapperList = (List<Object>) JSON.deserializeUntyped(wrapper);
        List<ObjectRelations> resultList = new List<ObjectRelations>();

        for (Object obj : wrapperList) {
            Map<String, Object> tempMap = (Map<String, Object>) obj;
            ObjectRelations relWrap = new ObjectRelations();
            relWrap.name = String.valueOf(tempMap.get('name')) ;
            relWrap.relationship = String.valueOf(tempMap.get('relationship'));
            relWrap.relationshipObject = String.valueOf(tempMap.get('relationshipObject'));
            relWrap.SObjectType = String.valueOf(tempMap.get('SObjectType'));
            resultList.add(relWrap);
        }
        return resultList;
    }

    public class CurrentFieldsWrapper {
        public Map<String, String> allFieldsMap { get; set; }
        public Map<String, String> urlAndReferenceMap { get; set; }
        public Map<String, String> urlFieldsMap { get; set; }
        public Map<String, String> fieldTypeMap { get; set; }
        public Map<String, String> referenceMap { get; set; }
        public Map<String, String> childRelationshipMap { get; set; }

        public CurrentFieldsWrapper() {
            allFieldsMap = new Map<String, String>();
            urlAndReferenceMap = new Map<String, String>();
            urlFieldsMap = new Map<String, String>();
            fieldTypeMap = new Map<String, String>();
            referenceMap = new Map<String, String>();
            childRelationshipMap = new Map<String, String>();
        }
    }

    public class ObjectDataWrapper implements Comparable{
        String name;
        String label;
        List<FieldWrapper> targetObject;

        public Integer compareTo(Object compareTo) {
            ObjectDataWrapper compWrap = (ObjectDataWrapper)compareTo;
            if (label == compWrap.label) return 0;
            if (label > compWrap.label) return 1;
            return -1;
        }
    }

    class FieldWrapper {
        String name;
        String label;
        String targetObject;
    }

    class SettingToEdit  {
        String Name;
        Map<String, Object> RelationWrapper;
    }

    class MainObjectWrapper {
        List<ObjectRelations> targetObject;
        String fieldString;
        String imageField;
        String objectFieldName;
        Map<String, Object> parentRelationMap;
        List<Object> childRelationList;
    }

    public class ObjectRelations {
        public String name;
        public String relationship;
        public String relationshipObject;
        public String SObjectType;
    }

    public class PicklistValue {
        List<Map<String, String>> editParentFieldObjectList { get; set; }
        List<List<String>> editChildFieldObjectList { get; set; }
        public PicklistValue() {
            editParentFieldObjectList = new List<Map<String, String>>();
            editChildFieldObjectList = new List<List<String>>();
        }
    }
}
