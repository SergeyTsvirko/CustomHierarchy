({
	getEditField : function(component, event, helper) {
		var editParentFieldObjectList = component.get("v.editParentFieldObjectList");
		var parentRelationObject = component.get("v.parentRelationObject");
		var referenceMap = JSON.parse(JSON.stringify(component.get("v.referenceMap")));
		var index = component.get("v.index");
		var relatedFieldList = [];

		for (var refNum in referenceMap) {
			if (referenceMap[refNum].value == parentRelationObject[index-1].reference) {
				referenceMap[refNum].selected = true;
				component.set("v.referenceMap", referenceMap);

				for (var key of	Object.keys(editParentFieldObjectList[index-1])) {
					var relatedField;
					if (parentRelationObject[index-1].field == key) {
						relatedField = { label: editParentFieldObjectList[index-1][key] , value: key, selected: true};
					} else {
						relatedField = { label: editParentFieldObjectList[index-1][key] , value: key};
					}

					relatedFieldList.push(relatedField);
				}
				break;
			}
		}

		component.set("v.relatedFieldList", relatedFieldList);
	},

	getRelatedFieldList : function(component, event, helper, chosenRelatedField) {
		var parentRelationObject = component.get("v.parentRelationObject");
		var index = component.get("v.index");
		parentRelationObject[index-1].reference = chosenRelatedField;
		parentRelationObject[index-1].field = "";
		component.set("v.parentRelationObject", parentRelationObject);
		var apexMethod = component.get("c.getObjectMap");

		apexMethod.setParams({
			lookupField: chosenRelatedField,
			objectName: component.get("v.objectName"),
			childRelationshipMap : JSON.stringify(component.get("v.childRelationshipMap"))
		});

		apexMethod.setCallback(this, function (response) {
			var state = response.getState();
			if (state == 'SUCCESS') {
				var fieldMap = JSON.parse(response.getReturnValue());

				var fieldObject = [];

				for (var key in fieldMap) {
					fieldObject.push({
						'label': fieldMap[key],
						'value': key
					});
				}

				component.set("v.relatedFieldList", fieldObject);
			} else {
				console.log('ERROR');
			}
		})
		$A.enqueueAction(apexMethod);
	},

	getChosenField : function(component, event, helper) {
		var chosenField = event.getSource().get("v.value");
		var parentRelationObject = component.get("v.parentRelationObject");
		parentRelationObject[component.get("v.index")-1].field = chosenField;
		component.set("v.parentRelationObject", parentRelationObject);
	},

	removeRow : function(component, event, helper) {
		var parentRelationObject = component.get("v.parentRelationObject");
		var index = component.get("v.index");
		parentRelationObject.splice(index-1, 1);
		component.set("v.parentRelationObject", parentRelationObject);
	},

	addParentRow : function(component, event, helper) {
		var parentRelationObject = component.get("v.parentRelationObject");
		parentRelationObject.push({
			'reference': '',
			'field': ''
		});

		component.set("v.parentRelationObject", parentRelationObject);
	}
})