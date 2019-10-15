({
    doInit : function(component, event, helper, parentRelationObject, childRelationObject) {
        var action = component.get("c.getFieldObjectMap");

        action.setParams({
            parentRelationObject: JSON.stringify(parentRelationObject),
            childRelationship : JSON.stringify(component.get("v.childRelationshipMap")),
            objectName : component.get("v.objectName"),
            childRelationObject : JSON.stringify(childRelationObject)
        });

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state == 'SUCCESS') {
                var result = JSON.parse(response.getReturnValue());
                component.set("v.editParentFieldObjectList", result.editParentFieldObjectList );
                component.set("v.editChildFieldObjectList", result.editChildFieldObjectList );
            } else {
                console.log('ERROR');
            }
        });
        $A.enqueueAction(action);
    },

    addParentRow : function(component, event, helper) {
        var parentRelationObject = component.get("v.parentRelationObject");
        parentRelationObject.push({
            'reference': '',
            'field': ''
        });

        component.set("v.parentRelationObject", parentRelationObject);
    },

    addChildRow : function(component, event, helper) {
        var childRelationObject = component.get("v.childRelationObject");

        childRelationObject.push({
            'object': "",
            'reference': "",
            'field': ""
        });

        component.set("v.childRelationObject", childRelationObject);
    },

    submitFields : function(component, event, helper) {
        var OBJECT_NAME = "object";
        var OBJECT_REF = "reference";
        var OBJECT_FIELD = "field";
        var resultObjectLookup = {};

        var parentRelationObject = component.get("v.parentRelationObject");

        for (var recordNum in parentRelationObject) {
            if (typeof resultObjectLookup[parentRelationObject[recordNum][OBJECT_REF]] == "undefined") {

                resultObjectLookup[parentRelationObject[recordNum][OBJECT_REF]] = parentRelationObject[recordNum][OBJECT_FIELD];
            } else {
                if (!resultObjectLookup[parentRelationObject[recordNum][OBJECT_REF]].includes(parentRelationObject[recordNum][OBJECT_FIELD]))
                    resultObjectLookup[parentRelationObject[recordNum][OBJECT_REF]] =
                    resultObjectLookup[parentRelationObject[recordNum][OBJECT_REF]] + "," +
                    parentRelationObject[recordNum][OBJECT_FIELD];
            }
        }

        var resultChildRelation = {};
        var childRelationObject = component.get("v.childRelationObject");

        for (var childNum in childRelationObject) {
            if (typeof resultChildRelation[childRelationObject[childNum][OBJECT_NAME]] == "undefined") {
                var referenceAndFieldObj = {};
                referenceAndFieldObj[childRelationObject[childNum][OBJECT_REF]] = childRelationObject[childNum][OBJECT_FIELD];
                resultChildRelation[childRelationObject[childNum][OBJECT_NAME]] = referenceAndFieldObj;
            } else {
               var referenceAndFieldObj = resultChildRelation[childRelationObject[childNum][OBJECT_NAME]];

               if (Object.keys(referenceAndFieldObj).includes(childRelationObject[childNum][OBJECT_REF])) {
                   referenceAndFieldObj[childRelationObject[childNum][OBJECT_REF]] =
                       referenceAndFieldObj[childRelationObject[childNum][OBJECT_REF]] + "," +
                       childRelationObject[childNum][OBJECT_FIELD];
               } else {
                   referenceAndFieldObj[childRelationObject[childNum][OBJECT_REF]] = childRelationObject[childNum][OBJECT_FIELD];
               }

                resultChildRelation[childRelationObject[childNum][OBJECT_NAME]] = referenceAndFieldObj;
            }
        }

        var eve = $A.get("e.c:objectLoocupEvent");
        eve.setParams({"parentRelationObject" : resultObjectLookup ,
                       "childRelationObject" : resultChildRelation ,
                        "parentRelationObjectEdit" : parentRelationObject,
                        "childRelationObjectEdit" : childRelationObject,
                        "parentRelationMap" : null,
                        "childRelationList" : null
                        });
        eve.fire();

        this.handleCancel(component, event, helper);
    },

    checkParentLookupList : function(component, event, helper) {
        var parentRelationObject = component.get("v.parentRelationObject");

        var parentSubmit = false;
        if (parentRelationObject.length < 1) {
            component.set("v.parentLookup", true);
            parentSubmit = false;
        } else {
            component.set("v.parentLookup", false);
        }

        for (var num in parentRelationObject) {
            if (parentRelationObject[num].reference != "") {
                if (parentRelationObject[num].field == "") {
                    parentSubmit = true;
                    break;
                }
            }
        }
        component.set("v.parentSubmit", parentSubmit);
    },

    checkChildrenLookupList : function(component, event, helper) {
        var childSubmit = false;
        if (component.get("v.childRelationObject").length < 1) {
            component.set("v.childLookup", true);
            childSubmit = false;
        } else {
            component.set("v.childLookup", false);
        }

        var childRelationObject = component.get("v.childRelationObject");

        for (var childNum in childRelationObject) {
            if (childRelationObject[childNum].object != "") {
                if (childRelationObject[childNum].field == "" || childRelationObject[childNum].reference == "") {
                    childSubmit = true;
                }
            }
        }
        component.set("v.childSubmit", childSubmit);
    },

    handleCancel : function(component, event, helper) {
        component.find("popuplib").notifyClose();
    },

    getRelationTab : function(component, event, helper) {
        var value = event.target.id;

        if (value == "true") {
            component.set("v.displayParentTab", true);
            component.set("v.displayChildTab", false);
            var parentRelationObject = component.get("v.parentRelationObject");

            if (parentRelationObject.length < 1) {
                parentRelationObject.push({
                    'reference': '',
                    'field': ''
                });

                component.set("v.parentRelationObject", parentRelationObject);
            }
        } else {
            component.set("v.displayParentTab", false);
            component.set("v.displayChildTab", true);
            var childRelationObject = component.get("v.childRelationObject");

            if (childRelationObject.length < 1) {
                childRelationObject.push({
                    'object': "",
                    'reference': "",
                    'field': ""
                });

                component.set("v.childRelationObject", childRelationObject);
            }
        }
    }
})