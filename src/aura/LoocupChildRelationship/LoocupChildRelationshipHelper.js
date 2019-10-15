({
	getEditField : function(component, event, helper) {
		var editChildFieldObjectList = component.get("v.editChildFieldObjectList");
		var childRelationObject = component.get("v.childRelationObject");
		var index = component.get("v.index");
		var currentObjectsOriginal = JSON.parse(JSON.stringify(component.get("v.currentObjectsOriginal")));

		for (var recNum in currentObjectsOriginal) {
			if (currentObjectsOriginal[recNum].name == childRelationObject[index-1].object) {
				currentObjectsOriginal[recNum].selected = true;

				var relationList = JSON.parse(JSON.stringify(currentObjectsOriginal[recNum].targetObject));
				var relationObj = [];

				for (recNum in relationList) {

					if (relationList[recNum] == childRelationObject[index - 1].reference) {
						relationObj.push({
							name : relationList[recNum],
							selected : true
						});
					} else {
						relationObj.push({
							name : relationList[recNum]
						});
					}
				}

				component.set("v.targetObjectRelation", relationObj);
				break;
			}
		}

		var fieldObj = [];
		for (recNum in editChildFieldObjectList[index-1]) {
			if (editChildFieldObjectList[index-1][recNum] == childRelationObject[index-1].field) {

				fieldObj.push({
					name : editChildFieldObjectList[index-1][recNum],
					selected : true
				});
			} else {
				fieldObj.push({
					name : editChildFieldObjectList[index-1][recNum]
				});
			}
		}

		component.set("v.currentObjectsOriginal", currentObjectsOriginal);
		component.set("v.fieldList", fieldObj);
	},

	getObjectName : function(component, event, helper) {
		var objName = event.getSource().get("v.value");
		var childRelationObject = component.get("v.childRelationObject");

		childRelationObject[component.get("v.index")-1].object = objName;
		childRelationObject[component.get("v.index")-1].field = '';
		childRelationObject[component.get("v.index")-1].reference = '';
		component.set("v.childRelationObject", childRelationObject);

		if (objName != '') {
				var currentObjectsOriginal = component.get("v.currentObjectsOriginal");
				for (var recNum in currentObjectsOriginal) {
					if (currentObjectsOriginal[recNum].name == objName) {
						var relationList = JSON.parse(JSON.stringify(currentObjectsOriginal[recNum].targetObject));
						var relationObj = [];
						for (recNum in relationList) {
							relationObj.push({
								name : relationList[recNum]
							});

							component.set("v.targetObjectRelation", relationObj);
							break;
						}
					}
				}

				var apexMethod = component.get("c.getFieldMapByObjectName");

				apexMethod.setParams({
					objectName: objName
				});

				apexMethod.setCallback(this, function (response) {
					var state = response.getState();
					if (state == 'SUCCESS') {
						var resultList = JSON.parse(response.getReturnValue());
						var fieldObj = [];
						for (recNum in resultList) {
							fieldObj.push({
								name : resultList[recNum]
							});
						}

						component.set("v.fieldList", fieldObj);
					} else {
						console.log('ERROR');
					}
				})
				$A.enqueueAction(apexMethod);
		} else {
			component.set("v.fieldList", null);
			component.set("v.targetObjectRelation", null);
		}
	},

	getChosenField : function(component, event, helper) {
		var fieldName = event.getSource().get("v.value");
		var childRelationObject = component.get("v.childRelationObject");

		childRelationObject[component.get("v.index")-1].field = fieldName;
		component.set("v.childRelationObject", childRelationObject);
	},

	getTargetRelation : function(component, event, helper) {
		var relationName = event.getSource().get("v.value");
		var childRelationObject = component.get("v.childRelationObject");

		childRelationObject[component.get("v.index")-1].reference = relationName;
		component.set("v.childRelationObject", childRelationObject);
	},

	removeRow : function(component, event, helper) {
		var childRelationObject = component.get("v.childRelationObject");
		var index = component.get("v.index");

		childRelationObject.splice(index-1, 1);
		component.set("v.childRelationObject", childRelationObject);
	},

	addChildRow : function(component, event, helper) {
		var childRelationObject = component.get("v.childRelationObject");

		childRelationObject.push({
			'object': "",
			'reference': "",
			'field': ""
		});

		component.set("v.childRelationObject", childRelationObject);
	}
})