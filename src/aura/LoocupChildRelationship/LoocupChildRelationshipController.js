({
	getEditField: function (component, event, helper) {
		helper.getEditField(component, event, helper);
	},

	getObjectName : function(component, event, helper) {
		helper.getObjectName(component, event, helper);
	},

	getChosenField : function(component, event, helper) {
		helper.getChosenField(component, event, helper);
	},

	getTargetRelation : function(component, event, helper) {
		helper.getTargetRelation(component, event, helper);
	},

	removeRow: function(component,event,helper) {
		helper.removeRow(component,event,helper);
	},

	addChildRow : function(component, event, helper) {
		helper.addChildRow(component, event, helper);
	},

	showAddButton : function(component, event, helper) {
		if (component.get("v.index") == component.get("v.childRelationObject").length) {
			component.set("v.buttonAdd", true);
		} else {
			component.set("v.buttonAdd", false);
		}
	}
})