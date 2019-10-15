({
	getEditField: function (component, event, helper) {
		helper.getEditField(component, event, helper);
	},

	getRelatedFieldList : function(component, event, helper) {
		var chosenRelatedField = event.getSource().get("v.value");
		helper.getRelatedFieldList(component, event, helper, chosenRelatedField);
	},

	getChosenField : function(component, event, helper) {
		helper.getChosenField(component, event, helper);
	},

	removeRow: function(component,event,helper) {
		helper.removeRow(component,event,helper);
	},

	addParentRow : function(component, event, helper) {
		helper.addParentRow(component, event, helper);
	},

	showAddButton : function(component, event, helper) {
		if (component.get("v.index") == component.get("v.parentRelationObject").length) {
			component.set("v.buttonAdd", true);
		} else {
			component.set("v.buttonAdd", false);
		}
	}
})