THREE.FirstPersonControls = function ( object, domElement, pointPicker ) {
    this.pointPicker = pointPicker;
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
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
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
		this.mouseX = this.mouseY = 0;
		if (document.pointerLockElement === this.domElement ||
			document.mozPointerLockElement === this.domElement ||
			document.webkitPointerLockElement === this.domElement) {
			// Pointer was just locked
			this.isPointerLocked = true;
		} else {
			// Pointer was just unlocked
			this.isPointerLocked = false;
		}
	};
	this.onMouseDown = function ( event ) {
		/*
		if(!this.isPointerLocked){
			// Ask the browser to lock the pointer
			this.domElement.requestPointerLock();
			return;
		}
		*/
		/*
		if ( this.domElement !== document ) {
			this.domElement.focus();
		}*/
		event.preventDefault();
		event.stopPropagation();
		/*
		if ( this.activeLook ) {
			switch ( event.button ) {
				case 0: this.moveForward = true; break;
				case 2: this.moveBackward = true; break;
			}
		}
		*/
		this.mouseDragOn = true;
	};
	this.onMouseUp = function ( event ) {
		event.preventDefault();
		event.stopPropagation();
		/*
		if ( this.activeLook ) {
			switch ( event.button ) {
				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;
			}
		}
		*/
		this.mouseDragOn = false;
	};
	this.onMouseMove = function ( event ) {
		this.mouseX += event.movementX;
		this.mouseY += event.movementY;
        this.mouse.x = ( event.clientX / this.domElement.width ) * 2 - 1;
        this.mouse.y = - ( event.clientY / this.domElement.height ) * 2 + 1;
	};
	this.onKeyDown = function ( event ) {
		switch( event.keyCode ) {
			case 16: /*SHIFT*/ this.moveDown = true; break;
			case 32: /*SPACE*/ this.moveUp = true; break;
			case 37: /*left*/ this.moveLeft = true; break;
			case 38: /*up*/ this.moveForward = true; break;
			case 39: /*right*/ this.moveRight = true; break;
			case 40: /*down*/ this.moveBackward = true; break;
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
			case 16: /*SHIFT*/ this.moveDown = false; break;
			case 32: /*SPACE*/ this.moveUp = false; break;
			case 37: /*left*/ this.moveLeft = false; break;
			case 38: /*up*/ this.moveForward = false; break;
			case 39: /*right*/ this.moveRight = false; break;
			case 40: /*down*/ this.moveBackward = false; break;
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
			actualMoveSpeed = delta * this.movementSpeed;
			if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
			if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );
			if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
			if ( this.moveRight ) this.object.translateX( actualMoveSpeed );
			if ( this.moveUp ) this.object.position.y += actualMoveSpeed ;
			if ( this.moveDown ) this.object.position.y -= actualMoveSpeed;
			actualLookSpeed = delta * this.lookSpeed;
			if ( !this.activeLook || !this.mouseDragOn ) {
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
        this.raycaster.setFromCamera( this.mouse, this.object );
        var intersects = this.raycaster.intersectObject( mesh );
        // Toggle rotation bool for meshes that we clicked
        if ( intersects.length > 0 ) {
            this.pointPicker.position.set( 0, 0, 0 );
            //helper.lookAt( intersects[ 0 ].face.normal );
            //align to grid
            var point = new THREE.Vector3();
            point.x = -intersects[ 0 ].point.z;
            point.y = -intersects[ 0 ].point.x;
            point.z = intersects[ 0 ].point.y;
            var distA = point.distanceTo(geometry.vertices[intersects[0].face.a]);
            var distB = point.distanceTo(geometry.vertices[intersects[0].face.b]);
            var distC = point.distanceTo(geometry.vertices[intersects[0].face.c]);
            var posMin = "a";
            var distMin = distA;
            if(distMin>distB){
                distMin = distB;
                posMin = "b";
            }
            if(distMin>distC){
                distMin = distC;
                posMin = "c";
            }
            var toPos = geometry.vertices[intersects[0].face[posMin]];
            this.pointPicker.position.x = -toPos.y;
            this.pointPicker.position.y = toPos.z;
            this.pointPicker.position.z = -toPos.x;
        }
    };
	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	window.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	window.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );
	document.addEventListener( 'pointerlockchange', bind( this, this.onPointerlockchange ), false );
	this.domElement.addEventListener( 'mozpointerlockchange', bind( this, this.onPointerlockchange ), false );
	this.domElement.addEventListener( 'webkitpointerlockchange', bind( this, this.onPointerlockchange ), false );
	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	}
};
