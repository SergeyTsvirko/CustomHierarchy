/**
 * Created by tsvirkos on 6/7/2019.
 */
({

	doInit: function (component, event, helper) {
		component.set("v.displayParentTab", true);

        var parentRelationMap = component.get("v.parentRelationMap");
        var childRelationList = component.get("v.childRelationList");
        var parentRelationObject = component.get("v.parentRelationObject");
		var childRelationObject = component.get("v.childRelationObject");

		if (parentRelationObject.length > 0 || childRelationObject.length > 0) {
			helper.doInit(component, event, helper, parentRelationObject, childRelationObject);
		} else {
			if (parentRelationMap || childRelationList) {
			    if (parentRelationMap) {
                    var parentRelationObject =[];

                    for (var parent of Object.keys(parentRelationMap)) {
                        var fieldArray = parentRelationMap[parent].split(',');
                        for (var fieldNum in fieldArray) {
                            parentRelationObject.push({
                                'reference': parent,
                                'field': fieldArray[fieldNum]
                            });
                        }
                    }

                    component.set("v.parentRelationObject", parentRelationObject);
                }

                if (childRelationList) {
                    var childRelationObject = [];

                    for (var objectName of Object.keys(childRelationList[0])) {
                        var relationFieldMap = childRelationList[0][objectName];

                        for (var relation of Object.keys(relationFieldMap)) {
                            var fieldList = relationFieldMap[relation].split(",");
                            for (var fieldNum in fieldList) {
                                childRelationObject.push({
                                    'object': objectName,
                                    'reference': relation,
                                    'field': fieldList[fieldNum]
                                });
                            }
                        }
                    }

                    component.set("v.childRelationObject", childRelationObject);
                }

                helper.doInit(component, event, helper, parentRelationObject, childRelationObject);
			} else {
				helper.addParentRow(component, event, helper);
			}
		}
	},

	handleCancel : function(component, event, helper) {
		helper.handleCancel(component, event, helper);
	},

	getRelationTab : function(component, event, helper) {
		helper.getRelationTab(component, event, helper);
	},

	addParentRow : function(component, event, helper) {
		helper.addParentRow(component, event, helper);
	},

	addChildRow : function(component, event, helper) {
		helper.addChildRow(component, event, helper);
	},

	submitFields : function(component, event, helper) {
		helper.submitFields(component, event, helper);
	},

	checkParentLookupList : function(component, event, helper) {
		helper.checkParentLookupList(component, event, helper);
	},

	checkChildrenLookupList : function(component, event, helper) {
		helper.checkChildrenLookupList(component, event, helper);
	}
})