({
    doInit: function (component, event, helper) {
        helper.doInitHelper(component, event, helper);
    },

    getObjectLoocupEvent: function (component, event, helper) {
        helper.getObjectLoocupEvent(component, event, helper);
    },

    handleChange: function (component, event, helper) {
        helper.handleChange(component, event, helper);
    },

    getParentObject: function (component, event, helper) {
        helper.getParentObject(component, event, helper);
    },

    getSecondParentObject: function (component, event) {
        var chosenField = event.getSource().get("v.value");
        var imageField = component.get("v.imageField");
        imageField = imageField + "." + chosenField;
        component.set("v.imageField", imageField);
    },

    cancelDialog : function(component, event, helper) {
        helper.cancelDialog(component, event, helper);
    },

    addHierarchy: function (component, event, helper) {
        helper.addHierarchy(component, event, helper);
    },

    handleShowNotice: function(component, event, helper) {
        helper.handleShowNotice(component, event, helper);
    }
})