({
    doInitHelper: function(component, event, helper) {
        var currentObjectsOriginal = [];
        var objectName = component.get("v.objectName");
        var objectsOriginal = component.get("v.objectsOriginal");
        for (var objectsNum in objectsOriginal) {
            var targetObjectList = [];
            for (var targetObjectNum in objectsOriginal[objectsNum]["targetObject"]) {
                if (objectsOriginal[objectsNum]["targetObject"][targetObjectNum]["name"] == objectName) {
                    targetObjectList.push(objectsOriginal[objectsNum]["targetObject"][targetObjectNum]["targetObject"]);
                }
            }

            if (targetObjectList.length > 0) {
                var tempObj = {};
                tempObj.targetObject = targetObjectList;
                tempObj.name = objectsOriginal[objectsNum]["name"];
                tempObj.label = objectsOriginal[objectsNum]["label"];
                currentObjectsOriginal.push(tempObj);
            }
        }

        component.set("v.currentObjectsOriginal", currentObjectsOriginal);
        var apexMethod = component.get("c.getFieldSet");

        apexMethod.setParams({
            objectName: component.get("v.objectName")
        });

        apexMethod.setCallback(this, function (response) {
            var state = response.getState();
            if (state == 'SUCCESS') {

                var resultMap = JSON.parse(response.getReturnValue());

                component.set("v.childRelationshipMap", resultMap.childRelationshipMap);
                component.set("v.fieldTypeMap", resultMap.fieldTypeMap);

                var urlAndReferenceObj = [];
                urlAndReferenceObj.push({
                    'label': "",
                    'value': ""
                });

                for (var key in resultMap.urlAndReferenceMap) {
                    urlAndReferenceObj.push({
                        'label': resultMap.urlAndReferenceMap[key],
                        'value': key
                    });
                }

                component.set("v.imageFieldList", urlAndReferenceObj);

                var referenceMap = [];

                for (var key in resultMap.referenceMap) {
                    referenceMap.push({
                        'label': resultMap.referenceMap[key],
                        'value': key
                    });
                }

                component.set("v.referenceMap", referenceMap);

                var objectFieldList = [];

                for (var key in resultMap.allFieldsMap) {
                    objectFieldList.push({
                        'label': resultMap.allFieldsMap[key],
                        'value': key
                    });
                }

                component.set("v.options", objectFieldList);
                var objectImageList = [];

                objectImageList.push({
                    'label': "-- None --",
                    'value': "-- None --"
                });

                for (var key in resultMap.urlFieldsMap) {
                    objectImageList.push({
                        'label': resultMap.urlFieldsMap[key],
                        'value': key
                    });
                }

                component.set("v.objects", objectImageList);
                if (component.get("v.recordId")) {
                    this.loadFieldSet(component, event, helper, objectImageList);
                }
            } else {
                console.log('ERROR');
            }
        });
        $A.enqueueAction(apexMethod);
    },

    loadFieldSet: function(component, event, helper, objectImageList) {
        var imageField = component.get("v.imageField");

        for (var object of objectImageList) {
            if (object.value == imageField) {
                object.selected = true;
                break;
            }
        }

        var fieldSet = component.get("v.fieldString").split(",");

        component.set("v.fieldSet", fieldSet);
        component.set("v.showSubmit", true);
        component.set("v.values", fieldSet);
    },

    getObjectLoocupEvent : function(component, event, helper) {
        component.set('v.mycolumns', [
            {label: 'Object name', fieldName: 'objectName', type: 'text'},
            {label: 'Relation name', fieldName: 'relationName', type: 'text'},
            {label: 'Fields list', fieldName: 'fieldList', type: 'text'}
        ]);

        var objectName = component.get("v.objectName");
        var parentRelationObject = event.getParam("parentRelationObject");
        component.set("v.parentRelationObject", parentRelationObject);

        var apexMethod = component.get("c.getObjectNameByRelatedField");
        apexMethod.setParams({
            lookupField : Object.keys(parentRelationObject).join(","),
            objectName: objectName,
            childRelationship : JSON.stringify(component.get("v.childRelationshipMap"))
        });

        apexMethod.setCallback(this, function (response) {
            var state = response.getState();
            if (state == 'SUCCESS') {
                var relationObjectName = JSON.parse(response.getReturnValue());
                var relationObjectList = [];

                for (var parent of Object.keys(parentRelationObject)) {
                    var parentObject = {};
                    parentObject['objectName'] = relationObjectName[parent];
                    parentObject['relationName'] = parent;
                    parentObject['fieldList'] = parentRelationObject[parent].split(',').join(', ');

                    relationObjectList.push(parentObject);
                }

                var childRelationObject  = event.getParam("childRelationObject");
                component.set("v.childRelationObject", childRelationObject);

                for (var objName of Object.keys(childRelationObject)) {
                    for (var relation of Object.keys(childRelationObject[objName])) {
                        var childObject = {};
                        childObject['objectName'] = objName;
                        childObject['relationName'] = relation;
                        childObject['fieldList'] = childRelationObject[objName][relation].split(',').join(', ');
                        relationObjectList.push(childObject);
                    }
                }

                component.set("v.relationObjectList", relationObjectList);

                component.set("v.parentRelationMap", event.getParam("parentRelationMap"));
                component.set("v.childRelationList", event.getParam("childRelationList"));
                component.set("v.parentRelationObjectEdit", event.getParam("parentRelationObjectEdit"));
                component.set("v.childRelationObjectEdit", event.getParam("childRelationObjectEdit"));

                if (Object.keys(relationObjectList.length > 0)) {
                    component.set("v.showRelationTable", true);
                } else {
                    component.set("v.showRelationTable", false);
                }
            } else {
                console.log('ERROR');
            }
        });
        $A.enqueueAction(apexMethod);
    },

    addHierarchy : function(component, event, helper) {
        component.set("v.showComponent", false);
        var apexMethod = component.get("c.addSettings");
        var imageField = component.get("v.imageField");

        if (imageField == "") {
            imageField = null;
        }

        var fieldStr = component.get("v.fieldSet");
        var element = null;

        for (var rec in fieldStr) {
            if (fieldStr[rec].includes('.')) {
                element = rec;
                break;
            }
        }

        if (element != null) {
            fieldStr.splice(element, 1);
        }

        fieldStr = fieldStr.reverse();

        apexMethod.setParams({
            recordId: component.get("v.recordId"),
            fieldString: fieldStr.join(","),
            wrapper: JSON.stringify(component.get("v.targetObject")),
            settingName: component.find("fstname").get("v.value"),
            imageField: imageField,
            objectFieldName: component.get("v.objectName"),
            parentRelationObject: JSON.stringify(component.get("v.parentRelationObject")),
            childRelationObject: JSON.stringify(component.get("v.childRelationObject"))
        });

        apexMethod.setCallback(this, function (response) {
            var state = response.getState();
            if (state == 'SUCCESS') {
                component.set("v.showSubmit", false);
                this.cancelDialog(component, event, helper);
            } else {
                console.log('ERROR');
            }
        });
        $A.enqueueAction(apexMethod);
    },

    cancelDialog: function(component, event, helper) {
        var homeEvt = $A.get("e.force:navigateToObjectHome");
        homeEvt.setParams({
            "scope": "HierarchySetting__c"
        });
        homeEvt.fire();
    },

    getParentObject: function(component, event, helper) {
        var chosenField = event.getSource().get("v.value");

        var fieldTypeMap = component.get("v.fieldTypeMap");
        if (fieldTypeMap[chosenField] == "URL") {
            component.set("v.imageField", chosenField);
            component.set("v.showFieldPicklist", false);
        } else {
            component.set("v.imageField", chosenField.replace("__c", "__r"));

            var apexMethod = component.get("c.getObjectName");

            apexMethod.setParams({
                lookupField: chosenField,
                objectName: component.get("v.objectName")
            });

            apexMethod.setCallback(this, function (response) {
                var state = response.getState();
                if (state == 'SUCCESS') {
                    component.set("v.showFieldPicklist", true);

                    var fieldMap = JSON.parse(response.getReturnValue());

                    var urlObjectMap = [];

                    for (var key in fieldMap) {
                        urlObjectMap.push({
                            'label': fieldMap[key],
                            'value': key
                        });
                    }

                    component.set("v.relatedImageFieldList", urlObjectMap);
                } else {
                    console.log('ERROR');
                }
            })
            $A.enqueueAction(apexMethod);
        }
    },

    handleChange: function(component, event, helper) {
        if (event.getParam("value").length > 0) {
            component.set("v.showSubmit", "true");
            component.set("v.fieldSet", event.getParam("value"));
        } else {
            component.set("v.showSubmit", "false");
            component.set("v.imageField", null);
        }
    },

    handleShowNotice: function(component, event, helper) {
        $A.createComponent("c:LoocupFieldSetting", {
            referenceMap : component.get("v.referenceMap"),
            objectName : component.get("v.objectName"),
            currentObjectsOriginal : component.get("v.currentObjectsOriginal"),
            childRelationshipMap : component.get("v.childRelationshipMap"),
            parentRelationMap : component.get("v.parentRelationMap"),
            parentRelationObject : component.get("v.parentRelationObjectEdit"),
            childRelationObject : component.get("v.childRelationObjectEdit"),
            relationObjectName : component.get("v.relationObjectName"),
            childRelationList : component.get("v.childRelationList")
        },

        function(content, status) {
            if (status === "SUCCESS") {
                component.find('overlayLib').showCustomModal({
                    body: content,
                    showCloseButton: false,
                    cssClass: "mymodal",
                    showCloseButton: true
                })
            } else {
                console.log('ERROR');
            }
        });
    }
})