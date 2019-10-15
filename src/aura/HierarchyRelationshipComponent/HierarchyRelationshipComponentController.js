({
    doInit: function (component, event, helper) {
        helper.doInit(component, event, helper);
    },

    getParentObject: function (component, event, helper) {
        helper.removeExtraLines(component, event);
        helper.getRelatedFields(component, event);
    },

    getTargetObject: function (component, event, helper) {
        helper.removeExtraLines(component, event);
        helper.getNewObject(component, event);
    },

    addNewRowObject: function (component, event, helper) {
        helper.addNewRowObjectHelp(component, event);
    }
})