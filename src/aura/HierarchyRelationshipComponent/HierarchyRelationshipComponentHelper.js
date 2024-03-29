/**
 * Created by ishchuko on 6/12/2019.
 */
({

    doInit: function (component, event, helper) {
        if (component.get("v.targetObjectOld") != null) {
            var index = component.get("v.index");
            var targetObjectOld = component.get("v.targetObjectOld");
            var selectedObjectrelationship = component.get("v.targetObjectOld")[component.get("v.index")-1].relationship;
            var selectedObjectName = component.get("v.targetObjectOld")[component.get("v.index")-1].name;
            var allObjects = component.get("v.objects");

            for (var obj of allObjects) {
                if (obj.name == selectedObjectName) {
                    if (index == 1) {
                        obj.selected = true;
                        component.set("v.objects", allObjects);
                    } else {
                        component.set("v.indexCheck", "false");
                        component.set("v.objectName", targetObjectOld[index-1].name);
                    }

                    for (var tar of obj.targetObject) {
                        if (tar.targetObject == selectedObjectrelationship) {
                            tar.selected = true;
                        }
                    }
                    component.set("v.targetObjects", obj.targetObject);
                    break;
                }
            }

        } else {
            var index = component.get("v.index");
            if (index > 1) {
                component.set("v.indexCheck", "false");
                helper.getRelatedFields(component,event);
            }
        }
    },

    getRelatedFields: function (component, event) {
        var chosenObject;
        if (component.get("v.index") > 1) {
            chosenObject = component.get("v.objectName");
        } else {
         chosenObject = event.getSource().get("v.value");
         component.set("v.chosenObject", chosenObject);
        }

        var allObjects = component.get("v.objectsOriginal");

        for (var obj of allObjects) {
            if (obj.name == chosenObject) {
                component.set("v.targetObjects", obj.targetObject);
                break;
            }
        }
    },

    getNewObject: function(component, event) {
        if (component.get("v.objectCount") != 3) {
            component.set("v.hideAllObjects", true);
        }

        var targetObject = event.getSource().get("v.value");
        var componentEvt = component.getEvent("targetObjectEvt");
        var targetObjects = component.get("v.targetObjects");
        var lastObject;

        for (var target of targetObjects) {
            if (target.targetObject == targetObject) {
                lastObject = target.name;
                break;
            }
        }

        if (component.get("v.index") == 1) {
              componentEvt.setParams({"showButton": true, "relatedObj": lastObject, "closingObject": targetObject,
              "chosenObject": component.get("v.chosenObject"), "objectName": component.get("v.objectName")});
           } else {
              componentEvt.setParams({"showButton": true, "relatedObj": lastObject, "closingObject": targetObject,
              "chosenObject": component.get("v.chosenObject"), "objectName": component.get("v.objectName")});
           }
        componentEvt.fire();
    },

    addNewRowObjectHelp: function(component, event) {
        component.set("v.hideAllObjects", false);
        var componentEvt = component.getEvent("addObjectEvt");
        componentEvt.setParams({"addObjectBool": true});
        componentEvt.fire();
    },

     removeExtraLines: function(component, event) {
         var objectCount = component.get("v.objectCount");
         var index = component.get("v.index");

         if (objectCount != index) {
             var componentEvt = component.getEvent("extraLinesEvt");
               componentEvt.setParams({"extraLines": index});
               componentEvt.fire();
         }
     }
})