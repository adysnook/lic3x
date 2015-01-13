THREE.FirstPersonControls = function ( object, domElement ) {
	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.movementSpeed = 1.0;
	this.lookSpeed = 0.005;
	this.noFly = false;
	this.lookVertical = true;
	this.autoForward = false;
	this.activeLook = true;
	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;
	this.autoSpeedFactor = 0.0;
	this.mouseX = 0;
	this.mouseY = 0;
	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;
	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.moveUp = false;
	this.moveDown = false;
	this.freeze = false;
	this.mouseDragOn = false;
	this.isPointerLocked = false;
	this.hideAll = false;
	this.domElement.requestPointerLock = this.domElement.requestPointerLock || this.domElement.mozRequestPointerLock || this.domElement.webkitRequestPointerLock;
	this.domElement.exitPointerLock = this.domElement.exitPointerLock || this.domElement.mozExitPointerLock || this.domElement.webkitExitPointerLock;
	if ( this.domElement === document ) {
		this.viewHalfX = window.innerWidth / 2;
		this.viewHalfY = window.innerHeight / 2;
	} else {
		this.viewHalfX = this.domElement.offsetWidth / 2;
		this.viewHalfY = this.domElement.offsetHeight / 2;
		this.domElement.setAttribute( 'tabindex', -1 );
	}
	this.resetControls = function(){
		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;
		this.moveUp = false;
		this.moveDown = false;
		this.isPointerLocked = false;
	};
	this.msL = function(){
		if(this.movementSpeed>=2){
			this.movementSpeed-=1.0;
			return;
		}
		this.movementSpeed/=2;
	};
	this.msH = function(){
		if(this.movementSpeed>=1){
			this.movementSpeed+=1.0;
			return;
		}
		this.movementSpeed*=2;
	};
	this.onPointerlockchange = function(event){
		if (document.pointerLockElement === this.domElement ||
			document.mozPointerLockElement === this.domElement ||
			document.webkitPointerLockElement === this.domElement) {
			// Pointer was just locked
			this.mouseX = this.mouseY = 0;
			this.isPointerLocked = true;
		} else {
			// Pointer was just unlocked
			this.isPointerLocked = false;
		}
	};
	this.onMouseDown = function ( event ) {
		if(!this.isPointerLocked){
			// Ask the browser to lock the pointer
			this.domElement.requestPointerLock();
			return;
		}
		/*
		if ( this.domElement !== document ) {
			this.domElement.focus();
		}*/
		event.preventDefault();
		event.stopPropagation();
		if ( this.activeLook ) {
			switch ( event.button ) {
				case 0: this.moveForward = true; break;
				case 2: this.moveBackward = true; break;
			}
		}
		this.mouseDragOn = true;
	};
	this.onMouseUp = function ( event ) {
		event.preventDefault();
		event.stopPropagation();
		if ( this.activeLook ) {
			switch ( event.button ) {
				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;
			}
		}
		this.mouseDragOn = false;
	};
	this.onMouseMove = function ( event ) {
		this.mouseX += event.movementX;
		this.mouseY += event.movementY;
	};
	this.onKeyDown = function ( event ) {
		switch( event.keyCode ) {
			case 17: /*CTRL*/ this.moveDown = true; break;
			case 32: /*SPACE*/ this.moveUp = true; break;
			case 37: /*left*/
			case 38: /*up*/
			case 39: /*right*/
			case 40: /*down*/
			case 65: /*A*/ this.moveLeft = true; break;
			case 68: /*D*/ this.moveRight = true; break;
			case 81: /*Q*/ this.freeze = !this.freeze; break;
			case 83: /*S*/ this.moveBackward = true; break;
			case 84: /*T*/ break;
			case 87: /*W*/ this.moveForward = true; break;
			case 90: /*Z*/ this.hideAll=!this.hideAll; break;
			case 96: /*NUM0*/ this.movementSpeed = 1.0; break;
			case 107:/*NUM+*/ this.msH(); break;
			case 109:/*NUM-*/ this.msL(); break;
			default: /*console.log("D"+event.keyCode);*/ return;
		}
		event.preventDefault();
		event.stopPropagation();
	};
	this.onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 17: /*CTRL*/ this.moveDown = false; break;
			case 32: /*SPACE*/ this.moveUp = false; break;
			case 37: /*left*/
			case 38: /*up*/
			case 39: /*right*/
			case 40: /*down*/
			case 65: /*A*/ this.moveLeft = false; break;
			case 68: /*D*/ this.moveRight = false; break;
			case 83: /*S*/ this.moveBackward = false; break;
			case 84: /*T*/ break;
			case 87: /*W*/ this.moveForward = false; break;
			default: return;
		}
		event.preventDefault();
		event.stopPropagation();
	};
	this.update = function( delta ) {
		var actualMoveSpeed = 0;
		var actualLookSpeed = 0;
		if ( !this.freeze ) {
			if ( this.heightSpeed ) {
				var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
				var heightDelta = y - this.heightMin;
				this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );
			} else {
				this.autoSpeedFactor = 0.0;
			}
			if(this.isPointerLocked) {
				actualMoveSpeed = delta * this.movementSpeed;
			}else{
				actualMoveSpeed = 0;
			}
			if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
			if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );
			if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
			if ( this.moveRight ) this.object.translateX( actualMoveSpeed );
			if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
			if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );
			actualLookSpeed = delta * this.lookSpeed;
			if ( !this.activeLook || !this.isPointerLocked ) {
				actualLookSpeed = 0;
			}
			this.lon += this.mouseX * actualLookSpeed;
			if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed;
			this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
			this.phi = ( 90 - this.lat ) * Math.PI / 180;
			this.theta = this.lon * Math.PI / 180;
			var targetPosition = this.target,
				position = this.object.position;
			targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
			targetPosition.y = position.y + 100 * Math.cos( this.phi );
			targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
		}
		var verticalLookRatio = 1;
		if ( this.constrainVertical ) {
			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );
		}
		this.lon += this.mouseX * actualLookSpeed;
		if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = ( 90 - this.lat ) * Math.PI / 180;
		this.theta = this.lon * Math.PI / 180;
		if ( this.constrainVertical ) {
			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );
		}
		var targetPosition = this.target,
			position = this.object.position;
		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
		this.object.lookAt( targetPosition );
		this.mouseX = this.mouseY = 0;
	};
	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );
	document.addEventListener( 'pointerlockchange', bind( this, this.onPointerlockchange ), false );
	this.domElement.addEventListener( 'mozpointerlockchange', bind( this, this.onPointerlockchange ), false );
	this.domElement.addEventListener( 'webkitpointerlockchange', bind( this, this.onPointerlockchange ), false );
	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	}
};
