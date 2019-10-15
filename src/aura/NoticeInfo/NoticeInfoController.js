/**
 * Created by tsvirkos on 6/7/2019.
 */
({
    handleCancel : function(component, event, helper) {
        component.find("popuplib").notifyClose();
    }
})