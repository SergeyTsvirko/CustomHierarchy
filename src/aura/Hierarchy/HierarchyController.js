({
    doInit : function(component, event, helper) {
        helper.doInit(component, event , helper, component.get("v.recordId"));
        $A.createComponent("c:NoticeInfo", {},
            function(content, status) {});
    },

    navigateHierarchyMain : function(component, event, helper) {
        helper.doInit(component, event , helper, event.target.id);
    },

    doneRendering:function(component,event,helper){
        helper.calculateNodesToDisplay(component);
    },

    showAllChildren:function(component){
        component.set("v.moreView", !component.get("v.moreView"));
    },

    handleShowNotice:function(component, event, helper) {
        helper.handleShowNotice(component);
    },

    navigateHierarchy:function(component,event,helper){
        helper.navigateHierarchy(component,event,true);
    },

    hideSearchList:function(component,event,helper){
        helper.hideSearchList(component);
    },

    filter:function(component,event,helper){
        helper.getFilteredList(component,event.getSource().get("v.value"));
    },

    navigateSearch : function(component, event, helper) {
        helper.hideSearchList(component);
        helper.doInit(component, event , helper, event.target.id);
    }
})