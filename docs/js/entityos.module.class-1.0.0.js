class EntityOS {
	invoke(controllerName, controllerParam) {
		return entityos._util.controller.invoke(controllerName, controllerParam)
	}

	add(controllerParam) {
		return entityos._util.controller.add(controllerParam)
	}

	set(param) {
		return entityos._util.data.set(param)
	}

	get(param) {
		return entityos._util.data.get(param)
	}

	view(param) {
		return entityos._util.view.queue.init(param)
	}

	param(param) {
		return entityos._util.param.get(param);
	}
}

export { EntityOS };