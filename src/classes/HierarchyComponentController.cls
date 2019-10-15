public without sharing class HierarchyComponentController {
    static final String FIELD_NAME = 'Name';
    static final String USER_IS_ACTIVE = ' AND IsActive = true ';

    @AuraEnabled
    @TestVisible public static List<SObject> getAllRecords(String searchValue, String hierarchyName) {
        List<HierarchySetting__c> hierarchySettingsList = [SELECT RelationWrapper__c
                                                           FROM HierarchySetting__c
                                                           WHERE Name =: hierarchyName];

        Map<String, Object> newMap = new Map<String, Object>();
        if (hierarchySettingsList != null && !hierarchySettingsList.isEmpty()) {
            newMap = (Map<String, Object>) JSON.deserializeUntyped(hierarchySettingsList[0].RelationWrapper__c);
        }

        List<Object> targetObjectList = (List<Object>) newMap.get('targetObject');
        Map<String, Object> targetObjectMap = new Map<String, Object>();

        if (targetObjectList != null && !targetObjectList.isEmpty()) {
            targetObjectMap = (Map<String, Object>) targetObjectList[0];
        }

        String query = 'SELECT Id, Name FROM ' + targetObjectMap.get('name') + ' WHERE Name LIKE \'%'+searchValue+'%\' ';

        if (targetObjectMap.get('name') != null) {
            if (targetObjectMap.get('name') == 'User') {
                query = query + USER_IS_ACTIVE;
            }
        }
        return Database.query(query);
    }

    @AuraEnabled
    @TestVisible public static String getObjectRelations(String objectId, String hierarchyName, String relationFieldName, String sObjectName) {
        if (!String.isEmpty(relationFieldName)) {
            List<SObject> currentRecordId = Database.query('SELECT ' + relationFieldName + ' FROM ' + sObjectName + ' WHERE Id =: objectId');
            if (currentRecordId != null && !currentRecordId.isEmpty()) {
                objectId = (String) currentRecordId[0].get(relationFieldName.replace('r.Id', 'c'));
            }
        }

        CurrentObjectData objectWrap = getObjectWrap(hierarchyName, relationFieldName, sObjectName , objectId);
        AllRelations result = getCurrentObjectData(objectWrap);
        result.parentsList = getAllParents(objectWrap.objectId, objectWrap.imageField, objectWrap.objectRelationList);
        result.childrenList = getAllChildren(objectWrap.objectId, objectWrap.imageField, objectWrap.objectRelationList);
        result.imageField = objectWrap.imageField;

        return JSON.serialize(result);
    }

    static CurrentObjectData getObjectWrap(String hierarchyName, String relationFieldName, String sObjectName , String objectId) {
        CurrentObjectData objectWrap = new CurrentObjectData();
        objectWrap.sObjectName = sObjectName;
        objectWrap.objectId = objectId;
        List<HierarchySetting__c> hierarchySettingsList = [SELECT RelationWrapper__c FROM HierarchySetting__c WHERE Name =: hierarchyName];
        Map<String, Object> newMap = new Map<String, Object>();

        if (hierarchySettingsList != null && !hierarchySettingsList.isEmpty()) {
            newMap = (Map<String, Object>) JSON.deserializeUntyped(hierarchySettingsList[0].RelationWrapper__c);
        }

        objectWrap.fieldsString = String.valueOf(newMap.get('fieldString'));
        objectWrap.imageField = String.valueOf(newMap.get('imageField'));
        objectWrap.objectFieldName = String.valueOf(newMap.get('objectFieldName'));
        objectWrap.parentRelationMap = (Map<String, Object>) newMap.get('parentRelationMap');
        objectWrap.childRelationList = (List<Object>) newMap.get('childRelationList');
        List<Object> rawObj = (List<Object>) newMap.get('targetObject');
        objectWrap.objectRelationList  = relationWrapper(rawObj);

        objectWrap.relFieldName = '';
        if (!String.isEmpty(relationFieldName)) {
            objectWrap.relFieldName = relationFieldName.replace('r.Id', 'c');
        }

        return objectWrap;
       // objectWrap.relFieldName = String.isNotBlank(relationFieldName) ? relationFieldName.replace('r.Id', 'c') : '';
    }

    static List<ObjectRelations> relationWrapper(List<Object> rawObj) {
        List<Map<String, Object>> wrapperList = new List<Map<String, Object>>();
        for (Object obj : rawObj) {
            wrapperList.add((Map<String, Object>)obj);
        }

        List<ObjectRelations> relationList = new List<ObjectRelations>();

        for (Map<String, Object> tempMap : wrapperList) {
            ObjectRelations temp = new ObjectRelations();
            temp.name = String.valueOf(tempMap.get('name')) ;
            temp.relationship = String.valueOf(tempMap.get('relationship'));
            temp.relationshipObject = String.valueOf(tempMap.get('relationshipObject'));
            relationList.add(temp);
        }
        return relationList;
    }

    static AllRelations getCurrentObjectData(CurrentObjectData objectWrap) {
        if (objectWrap.objectRelationList != null && objectWrap.objectRelationList[0].name != objectWrap.objectFieldName) {
            List<SObject> sObjectRecordIdList = Database.query('SELECT Id FROM ' + objectWrap.objectFieldName +
                    ' WHERE ' + objectWrap.relFieldName + ' =: objectWrap.objectId');

            if (sObjectRecordIdList != null && !sObjectRecordIdList.IsEmpty()) {
                objectWrap.objectId = sObjectRecordIdList[0].Id;
            }
        }

        List<SObject> currentRecordList = new List<SObject>();

        if (objectWrap.objectRelationList != null && !objectWrap.objectRelationList.isEmpty()) {
            String objectId = objectWrap.objectId;

            currentRecordList = Database.query('SELECT ' + objectWrap.fieldsString + getFieldString(objectWrap.parentRelationMap) +
                ' FROM ' + objectWrap.objectFieldName +
                ' WHERE Id =: objectId');
        }

        AllRelations lookupCurrentObject = getLookupObjectField(objectWrap, currentRecordList);
        AllRelations currentObject = getRelatedObjectField(objectWrap.childRelationList, objectWrap.objectId, lookupCurrentObject);

        return currentObject;
    }

    static AllRelations getRelatedObjectField(List<Object> childRelationList, String objectId, AllRelations lookupCurrentObject) {
        AllRelations currentObject = lookupCurrentObject;
            for (Object child : childRelationList) {
            Map<String, Object> relaterObjectMap = (Map<String, Object>) child;

            for (String objectName : relaterObjectMap.keySet()) {
                Map<String, Schema.SObjectField> fieldMap = new Map<String, Schema.SObjectField>();
                fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
                Map<String, Object> relationAndFieldsMap = (Map<String, Object>) relaterObjectMap.get(objectName);

                for (String relation : relationAndFieldsMap.keySet()) {
                    String fields = String.valueOf(relationAndFieldsMap.get(relation));

                    List<SObject> childList = new List<SObject>();
                    childList = Database.query('SELECT ' + fields +
                            ' FROM ' + objectName +
                            ' WHERE ' + relation + ' =: objectId');

                    if (childList != null && !childList.isEmpty()) {
                        for (String field : fields.split(',')) {
                            currentObject.currentRecordMap.put(fieldMap.get(field).getDescribe().getLabel(), String.valueOf(childList[0].get(field)));
                        }
                    }
                }
            }
        }
        return currentObject;
    }

    static AllRelations getLookupObjectField(CurrentObjectData objectWrap, List<SObject> currentRecordList) {
        Map<String, List<String>> parentFieldWrapper = new Map<String, List<String>>();
        Map<String,String> relationAndObjectMap = new Map<String,String>();

        if (objectWrap.parentRelationMap != null) {
            for (String key : objectWrap.parentRelationMap.keySet()) {
                String fieldString = (String) objectWrap.parentRelationMap.get(key);
                String currentObjectRelationField;

                if (key.contains('__r')) {
                    currentObjectRelationField = key.replace('__r', '__c');
                } else {
                    currentObjectRelationField = key + 'Id';
                }

                if (currentRecordList != null && !currentRecordList.isEmpty()) {
                    if (currentRecordList[0].get(currentObjectRelationField) != null) {
                        relationAndObjectMap.put(key, String.valueOf(currentRecordList[0].getSObject(key).getSObjectType()));
                        parentFieldWrapper.put(key, fieldString.split(','));
                    }
                }
            }
        }

        return getLookupCurrentObjectFields(parentFieldWrapper, relationAndObjectMap, objectWrap, currentRecordList);
    }

    static AllRelations getLookupCurrentObjectFields(Map<String, List<String>> parentFieldWrapper, Map<String,String> relationAndObjectMap,
            CurrentObjectData objectWrap, List<SObject> currentRecordList) {

        Map<String, Schema.SObjectField> fieldMap = new Map<String, Schema.SObjectField>();
        if (objectWrap.objectRelationList != null && !objectWrap.objectRelationList.isEmpty()) {
            fieldMap = Schema.getGlobalDescribe().get(objectWrap.objectFieldName).getDescribe().fields.getMap();
        }

        AllRelations currentObject = getNonLookupFieldList(objectWrap, currentRecordList, fieldMap);

        for (String relation : parentFieldWrapper.keySet()) {
            if (objectWrap.objectRelationList != null && !objectWrap.objectRelationList.isEmpty()) {
                fieldMap = Schema.getGlobalDescribe().get(relationAndObjectMap.get(relation)).getDescribe().fields.getMap();
            }

            if (currentRecordList != null && !currentRecordList.isEmpty()) {
                for (String field : parentFieldWrapper.get(relation)) {
                    currentObject.currentRecordMap.put(fieldMap.get(field).getDescribe().getLabel(),
                            String.valueOf(currentRecordList[0].getSObject(relation).get(field)));
                }
            }
        }

        if (currentRecordList != null && !currentRecordList.isEmpty()) {
            currentObject.currentRecord = currentRecordList[0];
        }

        return currentObject;
    }

    static AllRelations getNonLookupFieldList(CurrentObjectData objectWrap, List<SObject> currentRecordList, Map<String, Schema.SObjectField> fieldMap) {
        AllRelations currentObject = new AllRelations();
        currentObject.currentRecordMap = new Map<String, String>();
        for (String field : objectWrap.fieldsString.split(',')) {
            if (field != FIELD_NAME) {
                if (currentRecordList != null && !currentRecordList.isEmpty()) {
                    if (field == objectWrap.imageField) {
                        if (field.contains('.')) {
                            Sobject userObj = (SObject)currentRecordList[0].getSObject(field.substringBefore('.'));
                            if (userObj != null) {
                                currentObject.imageLink = String.valueOf(userObj.get(field.substringAfter('.')));
                            }
                        } else {
                            currentObject.imageLink = String.valueOf(currentRecordList[0].get(field));
                        }
                    } else {
                        currentObject.currentRecordMap.put(fieldMap.get(field).getDescribe().getLabel(), String.valueOf(currentRecordList[0].get(field)));
                    }
                }
            }
        }
        return currentObject;
    }

    static List<SObject> getAllParents(String objectId, String imageField, List<ObjectRelations> objectRelationList) {
        List<SObject> parentsList = new List<SObject>();
        Set<Id> parentIdSet = new Set<Id>();
        for (Boolean isParentNull = true; isParentNull && Limits.getLimitQueries() > 0;) {
            List<SObject> parentIdList = getParentIdList(objectRelationList, objectId);

            List<SObject> tempParentList = new List<SObject>();
            if (parentIdList != null && !parentIdList.isEmpty()) {
                tempParentList = getObjectRow(String.valueOf(parentIdList[0].get(objectRelationList[objectRelationList.size()-1].relationship)), imageField, objectRelationList);
            } else {
                isParentNull = false;
            }

            if (tempParentList != null && !tempParentList.isEmpty()) {
                if (parentIdSet.contains(tempParentList[0].Id)) {
                    isParentNull = false;
                } else {
                    parentIdSet.add(tempParentList[0].Id);
                    parentsList.add(tempParentList[0]);
                }
            }

            if (parentIdList != null && !parentIdList.isEmpty()) {
                objectId = String.valueOf(parentIdList[0].get(objectRelationList[objectRelationList.size()-1].relationship));
            } else {
                objectId = null;
            }
        }

        return parentsList;
    }

    static String getFieldString(Map<String, Object> parentRelationMap) {
        String resultFieldString = '';
        List<String> fieldList = new List<String>();

        if (parentRelationMap != null) {
            for (String key : parentRelationMap.keySet()) {
                String fieldString = (String) parentRelationMap.get(key);
                for (String field : fieldString.split(',')) {
                    if (field.contains('__c')) {
                        field = field.replace('__c', '__r');
                    }
                    fieldList.add(key + '.' + field);
                }
            }
        }

        if (fieldList != null && !fieldList.isEmpty()) {
            resultFieldString = ',' + String.join(fieldList, ',');
        }

        return resultFieldString;
    }

    static List<SObject> getAllChildren(String objectId, String imageField, List<ObjectRelations> objectRelationList) {
        List<String> stringIdList = new List<String>();
        if (objectRelationList.size() == 1) {
            stringIdList.add(objectId);
        } else {
            for (SObject rec : getChildrenIdList(objectRelationList, objectId)) {
                stringIdList.add(rec.Id);
            }
        }

        String conditions = ' IN: stringIdList ';
        if (objectRelationList != null && !objectRelationList.isEmpty() && objectRelationList[0].name == 'User') {
            conditions = conditions + USER_IS_ACTIVE;
        }

        String fields = 'Name ';
        if (imageField != null) {
            fields = fields + ',' + imageField;
        }

        List<SObject> childrenList = new List<SObject>();
        if (objectRelationList != null && !objectRelationList.isEmpty()) {
            childrenList = Database.query('SELECT ' + fields +
                    ' FROM ' + objectRelationList[0].name +
                    ' WHERE ' + objectRelationList[0].relationship + conditions);
        }

        return childrenList;
    }

    static List<SObject> getChildrenIdList(List<ObjectRelations> objectRelationList, String objectId) {
        List<String> objectIdList = new List<String>();
        objectIdList.add(objectId);

        List<SObject> childrenIdList = new List<SObject>();
        for (Integer i = objectRelationList.size()-1; i > 0; i--) {
            childrenIdList = Database.query('SELECT Id ' +
                    'FROM ' + objectRelationList[i].name +
                    ' WHERE ' + objectRelationList[i].relationship + ' IN: objectIdList');

            if (childrenIdList != null && !childrenIdList.isEmpty()) {
                List<String> objectIdTempList = new List<String>();
                for (SObject children : childrenIdList) {
                    objectIdTempList.add(String.valueOf(children.get('Id')));
                }
                objectIdList = objectIdTempList;
            }
        }
        return childrenIdList;
    }

    static List<SObject> getParentIdList(List<ObjectRelations> objectRelationList, String objectId) {
        List<SObject> parentIdList = new List<SObject>();
        for (ObjectRelations rec : objectRelationList) {
            parentIdList = Database.query('SELECT ' + rec.relationship +
                    ' FROM ' + rec.name +
                    ' WHERE Id  =: objectId');

            if (parentIdList == null || parentIdList.isEmpty()) {
                break;
            }
            objectId = String.valueOf(parentIdList[0].get(rec.relationship));
        }
        return parentIdList;
    }

    static List<SObject> getObjectRow(String targetRecordId, String imageField, List<ObjectRelations> objectRelationList) {
        String conditions = ' WHERE Id =: targetRecordId ';
        if (objectRelationList != null && !objectRelationList.isEmpty() && objectRelationList[0].name == 'User') {
            conditions = conditions + USER_IS_ACTIVE;
        }

        String fields = 'Name ';
        if (imageField != null) {
            fields = fields + ',' + imageField;
        }

        List<SObject> objectFieldList = new List<SObject>();
        if (objectRelationList != null && !objectRelationList.isEmpty()) {
            objectFieldList = Database.query('SELECT ' + fields + ' FROM ' + objectRelationList[0].name + conditions);
        }

        return objectFieldList;
    }

    public class CurrentObjectData {
        public List<ObjectRelations> objectRelationList;
        public String fieldsString;
        public String objectId;
        public String imageField;
        public String sObjectName;
        public String relFieldName;
        public String objectFieldName;
        public Map<String, Object> parentRelationMap;
        public List<Object> childRelationList;
    }

    public class AllRelations {
        public SObject currentRecord;
        public String imageLink;
        public String imageField;
        public Map<String, String> currentRecordMap;
        public List<SObject> parentsList;
        public List<SObject> childrenList;
    }

    public class ObjectRelations {
        public String name;
        public String relationship;
        public String relationshipObject;
    }
}