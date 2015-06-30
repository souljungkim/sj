


/* 크로스브라우징을 위한 설정 및 보조함수 모음 */
var sjHelper = new SJMouseGetPowerHelper();
/* 이벤트 발생시 핵심 함수 */
var sj = new SJMouseGetPower();

/* 초기 이벤트 설정*/
sjHelper.cross.addEventListener(window, 'load', SJMouseGetPowerAfterLoad);





/*********************************************
 * 
 * 					속성 적용
 * 
 *********************************************/
function SJMouseGetPowerAfterLoad(){
	/** 드래그 선택 불가 **/
	sjHelper.cross.disableSelection(document.body);
	
	/** 모바일여부 확인 **/
    sj.isMobile = sjHelper.isMobile();    
    
    
    
	if (!sj.isAdapted) {
		sj.isAdapted = true;
		/** 이벤트의 중원을 맡으실 분들 **/
		if (sj.isMobile){
			sjHelper.cross.addEventListener(document, 'touchstart', function(event){sj.whenMouseDown(event)});
			sjHelper.cross.addEventListener(document, 'touchmove', function(event){sj.whenMouseMove(event)});	
			sjHelper.cross.addEventListener(document, 'touchend', function(event){sj.whenMouseUp(event)});
		}else{
			sjHelper.cross.addEventListener(document, 'mousedown', function(event){sj.whenMouseDown(event)});
			sjHelper.cross.addEventListener(document, 'mousemove', function(event){sj.whenMouseMove(event)});
			sjHelper.cross.addEventListener(document, 'mouseup', function(event){sj.whenMouseUp(event)});
			sjHelper.cross.addEventListener(window, 'resize', function(event){sj.whenResize(event);});
		}
	}
	
	/** 뷰어마다 적용(paint) **/	
	var setedObjs = sjHelper.cross.querySelectorAll('[data-type^=paint]');
	for (var j=0; j<setedObjs.length; j++){
		var viewer = setedObjs[j];
		if (viewer.isAdaptedView) continue;
		viewer.isAdaptedView = true;
		
		var storage;
		var canvas;
		for (var k=0; k<viewer.children.length; k++){
			/** storage 설정 **/
			if (viewer.children[k].getAttribute('data-type') == 'storage') storage = viewer.children[k];
		}
		if (storage){
			/** canvas 설정 **/
			for (var l=0; l<storage.children.length; l++){
				if (storage.children[l].tagName.toLowerCase() == 'canvas') canvas = storage.children[l];
			}		
		}
						
		if (canvas){
			/* 캔버스 크기를 부모에 맞게 조정 */
			canvas.width = canvas.parentNode.offsetWidth;
			canvas.height = canvas.parentNode.offsetHeight;			
			
			if(sj.isMobile){
				sjHelper.cross.addEventListener(canvas, 'touchstart', function(event){sj.paintStart(event, this)});
				sjHelper.cross.addEventListener(canvas, 'touchmove', function(event){sj.paint(event, this)});				
				sjHelper.cross.addEventListener(canvas, 'touchend', function(event){sj.paintEnd(event, this)});
			}else{
				sjHelper.cross.addEventListener(canvas, 'mousedown', function(event){sj.paintStart(event, this)});
				sjHelper.cross.addEventListener(canvas, 'mousemove', function(event){sj.paint(event, this)});
				sjHelper.cross.addEventListener(canvas, 'mouseup', function(event){sj.paintEnd(event, this)});
			}
		}
	}
	
	
	/** 뷰어마다 적용(scrollview) **/
	var setedObjs = sjHelper.cross.querySelectorAll('[data-type^=scrollview]');
	for (var j=0; j<setedObjs.length; j++){
		var viewer = setedObjs[j];	
		if (viewer.isAdaptedView) continue;
		viewer.isAdaptedView = true;
		
		var viewerHead;
		var storage;
		for (var k=0; k<viewer.children.length; k++){
			/** top 설정 **/
			if (viewer.children[k].getAttribute('data-type') == 'head'){
				viewerHead = viewer.children[k];			
			}
			/** storage 설정 **/
			if (viewer.children[k].getAttribute('data-type') == 'storage'){
				/* 시작과 박스인 박스아웃 */
				/* 초기 크기 설정 */
				storage = viewer.children[k];
				var storageWidth = 0;				
				for (var l=0; l<storage.children.length; l++){
					storageWidth += storage.children[l].offsetWidth + 20;				
				}	
				if(storage.parentNode.offsetWidth < storageWidth){
					storage.style.width = (storageWidth + 50) + 'px';
				}else{
					storage.style.width = '100%';
				}
				
				/*storage만 스크롤하기 위한 도우미Div생성*/
				viewer.scroller = sjHelper.getNewDiv('', 'assistant', '');
				viewer.scroller.setAttribute('data-type','assistant');
				viewer.scroller.style.width = '100%';
				viewer.scroller.style.height = '';
				viewer.scroller.style.overflow = "auto";
				viewer.scroller.appendChild(storage);
				viewer.appendChild(viewer.scroller);
				storage.linkedScroller = viewer.scroller;
				/* 박스IN OUT 할 때, 반드시 일어나야 하는 이벤트 설정 */ //임시방편으로 리사이즈할때와 같이 설정
				storage.executeEventMustDo = sj.whenResize;
				
				/* Touch Sensor on Mobile*/
				if (sj.isMobile){
					sjHelper.cross.addEventListener(storage.linkedScroller, 'touchstart', function(event){sj.whenTouchDownOnScrollview(event, this);});
					sjHelper.cross.addEventListener(storage.linkedScroller, 'touchmove', function(event){sj.whenTouchMoveOnScrollview(event, this);});	
					sjHelper.cross.addEventListener(storage.linkedScroller, 'touchend', function(event){sj.whenTouchUpOnScrollview(event, this);});
				}
			}
		}
	}
	
	
	
	/** 뷰어 적용(slideview) **/
	var setedObjs = sjHelper.cross.querySelectorAll('[data-type^=slideview]');
	for (var j=0; j<setedObjs.length; j++){
		var viewer = setedObjs[j];
		if (viewer.isAdaptedView) continue;
		viewer.isAdaptedView = true;
		
		var viewerType = viewer.getAttribute('data-type');
		var viewerHead = undefined;
		var viewerIndex = undefined; 
		var storage = undefined;
		
		
		
		/** viewer 설정 **/
		if (viewer) {
			/* viewer의 자식객체들 주소 저장 */
			for (var k=0; k<viewer.children.length; k++){
				/** top 객체 주소 저장 **/
				if (viewer.children[k].getAttribute('data-type') == 'head')	viewerHead = viewer.children[k];
				/** storage 객체 주소 저장 **/
				if (viewer.children[k].getAttribute('data-type') == 'storage')	storage = viewer.children[k];
				/** index, tap 객체 주소 저장 **/
				if (viewer.children[k].getAttribute('data-type') == 'tap'
				|| viewer.children[k].getAttribute('data-type') == 'index')	viewerIndex = viewer.children[k];
			}
			
			/* 이벤트 저장 (슬라이드 뷰에서 슬라이드 발생시마다)*/
			var eventFn = setedObjs[j].getAttribute('data-event-slide');
			if (eventFn != null && eventFn != undefined){
				/* 이벤트 함수 만들기 */			
				viewer.executeEventSlide = new Function('box', 'nowSlide', 'index', eventFn);
			}
		}
		
		
		
		/** storage 설정 **/
		if (storage){
			/* 시작, 박스인, 박스아웃, 리사이즈 발생시 설정되어야 함*/
			/* 초기 크기 설정 */				
			var storageWidth = 0;				
			for (var l=0; l<storage.children.length; l++){
				storage.children[l].style.width = storage.children[l].offsetWidth + 'px';
				storageWidth += storage.children[l].offsetWidth + 10;
				
				/* 이벤트 저장 (각 슬라이드가 On될 때 마다)*/
				var eventFn = storage.children[l].getAttribute('data-event-slide');
				if (eventFn != null && eventFn != undefined){
					/* 이벤트 함수 만들기 */			
					storage.children[l].executeEventSlide = new Function('box', 'nowSlide', 'index', eventFn);
				}
			}			
			storage.style.width = storageWidth + 'px';			
			/*storage만 스크롤하기 위한 도우미Div생성*/
			viewer.slider = sjHelper.getNewDiv('', 'assistant', '');
			viewer.slider.setAttribute('data-type','assistant');
			viewer.slider.style.width = '100%';
			viewer.slider.style.height = '';
			viewer.slider.style.overflow = "hidden";
			viewer.slider.appendChild(storage);
			viewer.appendChild(viewer.slider);			
			storage.linkedSlider = viewer.slider;
			/* 박스IN OUT 할 때, 반드시 일어나야 하는 이벤트 설정 */ //임시방편으로 리사이즈할때와 같이 설정
			storage.executeEventMustDo = sj.whenResize;
			
			/** slide view 슬라이드 저장소 설정 **/
			if (viewerType=='slideview'){
				var newSeqId = sjHelper.getNewSeqId('slideviewBox');
				viewer.storage = storage;
				storage.id = newSeqId;
				storage.nowShowingChildIdx = 0;
				viewer.slider.scrollLeft = storage.children[storage.nowShowingChildIdx].offsetWidth * storage.nowShowingChildIdx ;
				/* Touch Sensor on Mobile*/
				if (sj.isMobile){
					/* 터치로 좌우로 끌어 당기면 슬라이드 전환 가능 */
					sjHelper.cross.addEventListener(storage.linkedSlider, 'touchstart', function(event){sj.whenTouchDownOnSlideview(event, this);});
					sjHelper.cross.addEventListener(storage.linkedSlider, 'touchmove', function(event){sj.whenTouchMoveOnSlideview(event, this);});	
					sjHelper.cross.addEventListener(storage.linkedSlider, 'touchend', function(event){sj.whenTouchUpOnSlideview(event, this);});
				}else{
					/* shift + wheel 또는 alt + wheel로 슬라이드 전환 가능 */
					sjHelper.cross.addEventListener(window, 'keydown', function(event){sj.whenKeyDown(event);});
					sjHelper.cross.addEventListener(window, 'keyup', function(event){sj.whenKeyUp(event);});
					sjHelper.cross.addEventListener(viewer, 'mousewheel', function(event){sj.whenMouseWheel(event, this);});
				}
			}
			/** slide view - auto 슬라이드 저장소 설정 (왔다갔다 스크롤) **/
			if (viewerType=='slideview-auto'){
				viewer.timerSlideLeft = undefined;
				viewer.timerSlideRight = undefined;
				viewer.setSlideLeft = undefined
				viewer.setSlideRight = undefined
				
				viewer.setSlideRight = function(viewer){
					if (viewer.timerSlideLeft) clearInterval(viewer.timerSlideLeft);				
					viewer.timerSlideRight = setInterval(
							function(){
								if (viewer.slider.scrollLeft<=0) viewer.setSlideLeft(viewer);
								viewer.slider.scrollLeft -= 1;
							}
							, 8);
				};
				viewer.setSlideLeft = function(viewer){
					clearInterval(viewer.timerSlideRight);
					viewer.timerSlideLeft  = setInterval(
							function(){
								if (viewer.slider.scrollLeft>=viewer.slider.scrollWidth-viewer.slider.offsetWidth -10) viewer.setSlideRight(viewer);						
								viewer.slider.scrollLeft += 1;
							}
							, 8);
				};
				viewer.setSlideRight(viewer);
			}
		}
			
		/** index 설정 **/
		if (viewerIndex	&& storage){
			viewerIndex.innerHTML += '<div data-type="optionRight" onclick="sj.slideToRight('+newSeqId+');"><</div>';
			viewerIndex.innerHTML += '<div data-type="optionLeft" onclick="sj.slideToLeft('+newSeqId+');">></div>';
		
			var viewerIndexList = sjHelper.getNewDiv('', '', '');
			viewerIndexList.setAttribute('data-type','index-list');
			storage.linkedViewerIndexList = viewerIndexList;
			
			if (viewerIndex.getAttribute('data-type')=='index'){
				for (var l=0; l<storage.children.length; l++){
					storage.children[l].id = newSeqId + 'storageData' + l;
					viewerIndexList.innerHTML += '<div data-type="option" onclick="sj.slideTo('+newSeqId+', '+l+');">o</div>';
				}
			}
			if (viewerIndex.getAttribute('data-type')=='tap'){
				for (var l=0; l<storage.children.length; l++){
					storage.children[l].id = newSeqId + 'storageData' + l;						
					var tapTitle; 
					for (var m=0; m<storage.children[l].children.length; m++){
						if (storage.children[l].children[m].getAttribute('data-type') == 'title'){
							tapTitle = storage.children[l].children[m];
						} 
					}
					
					var viewerIndexListOption = sjHelper.getNewDiv('', '', '');
					viewerIndexListOption.setAttribute('data-type', 'option');
					viewerIndexListOption.setAttribute('onclick', 'sj.slideTo('+newSeqId+', '+l+');');						
					viewerIndexListOption.appendChild(tapTitle);
					viewerIndexList.appendChild(viewerIndexListOption);
				}
			}
			
			sj.expressNowSlide(storage);
			viewerIndex.appendChild(viewerIndexList);
		}
		
		
	}
	
	
	/** 객체의 밑바닥을 브라우저 viewport범위에서 최하단까지 사이즈 늘이기 **/
	var setedObjs = sjHelper.cross.querySelectorAll('[data-height-down]');
	for (var j=0; j<setedObjs.length; j++){
		if (setedObjs[j].isAdaptedHeightDown) continue;
		setedObjs[j].isAdaptedHeightDown = true;
		
		var bodyOffset = sjHelper.getBodyOffset(setedObjs[j]);
		setedObjs[j].style.height = ((window.innerHeight) - bodyOffset.y - 10) +'px'; //window.innerHeight은 표준이니 모르겠다.
	}
	
	/** 객체마다 적용(이미지) **/
	var setedObjs = sjHelper.cross.querySelectorAll('[data-img]');
	for (var j=0; j<setedObjs.length; j++){
		if (setedObjs[j].isAdaptedImg) continue;
		setedObjs[j].isAdaptedImg = true;
		
		var img = new Image();
		img.src = setedObjs[j].getAttribute('data-img');
		setedObjs[j].style.background = 'url(' +img.src+ ') no-repeat center';
		setedObjs[j].style.backgroundSize = '100% 100%';
		img.objDiv = setedObjs[j];		
		img.onload = function(){
			/* 사이즈가 설정되어 있다면 그에 따른다 */
			var w = this.objDiv.getAttribute('width');
			var h = this.objDiv.getAttribute('height');
			this.objDiv.style.width = (w) ? w+'px' : this.width+'px';
			this.objDiv.style.height =(h) ? h+'px' : this.height+'px';
		};		
	}
	
	/** 객체마다 적용(상자 끌기) **/
	var setedObjs = sjHelper.cross.querySelectorAll('[data-movable]');
	for (var j=0; j<setedObjs.length; j++){
		if (setedObjs[j].isAdaptedMovable) continue;
		setedObjs[j].isAdaptedMovable = true;	

		sjHelper.cross.classList.add(setedObjs[j], 'sj-obj-movable');

		if (sj.isMobile){
			sjHelper.cross.addEventListener(setedObjs[j], 'touchstart', function(event){sj.objStartMove(this, event)});
		}else{
			sjHelper.cross.addEventListener(setedObjs[j], 'mousedown', function(event){sj.objStartMove(this, event)});
		}

		sjHelper.cross.addEventListener(setedObjs[j], 'click', function(){});		
		setedObjs[j].style.left = setedObjs[j].offsetLeft + 'px';
		setedObjs[j].style.top = setedObjs[j].offsetTop + 'px';		
	}
	// 사이즈 조절 되었을 때 드래그 안한 객체들이 반응 하는 로직도 필요 할 것 같은데.. 보류
	/*for (var j=0; j<setedObjs.length; j++){
		setedObjs[j].style.position = "absolute";
	}*/
	
	
	/** 객체마다 적용(상자 클릭) **/
	var setedObjs = sjHelper.cross.querySelectorAll('[data-event-click]');
	for (var j=0; j<setedObjs.length; j++){
		if (setedObjs[j].isAdapted) continue;
		setedObjs[j].isAdapted = true;
		
		var eventFn = setedObjs[j].getAttribute('data-event-click');
		if (eventFn != null && eventFn != undefined){
			var temp = eventFn;
			eventFn = 'sjHelper.cross.stopPropagation(event);'
			/* drag and drop일 경우를 방지 */
			eventFn += 'if(sj.getIsOnMoving()) return false;'
			eventFn += temp;
			/* 이벤트 함수 만들기 */			
			setedObjs[j].executeEventClick = new Function('box','obj','boxSize', eventFn);
			/* click이벤트 발생시 작동 */
			setedObjs[j].onclick = function(){this.executeEventClick(this.parentNode.parentNode.parentNode)};			
		}
	}
	
	
	/** 객체마다 적용(설명상자) **/
	if (!sj.isMobile){
		var setedObjs = sjHelper.cross.querySelectorAll('[data-previewer]');
		for (var j=0; j<setedObjs.length; j++){
			if (setedObjs[j].isAdapted) continue;
			setedObjs[j].isAdapted = true;
			
			/* 설명상자 생성 */
			if (sj.getPreviewer() == undefined) {
				sj.setPreviewer(sjHelper.getNewDiv('', 'sj-previewer', 'aaa'));
				document.body.appendChild(sj.getPreviewer());
				sj.getPreviewer().style.display = 'none';			
			}
			sjHelper.cross.classList.add(setedObjs[j], 'sj-obj-previewable');
			
			if (sj.isMobile){
				/*
				sjHelper.cross.addEventListener(setedObjs[j], 'touchend', sj.objMouseOut);
				sjHelper.cross.addEventListener(setedObjs[j], 'touchmove', sj.objMouseMove);
				*/
			}else{
				sjHelper.cross.addEventListener(setedObjs[j], 'mouseout', sj.objMouseOut);
				sjHelper.cross.addEventListener(setedObjs[j], 'mousemove', sj.objMouseMove);
			}
	
		}
	}
	
	/** 객체마다 적용(담는 상자) **/
	var setedObjs = sjHelper.cross.querySelectorAll('[data-box]');
	for (var j=0; j<setedObjs.length; j++){
		if (setedObjs[j].isAdaptedBox) continue;
		setedObjs[j].isAdaptedBox = true;
		
		sjHelper.cross.classList.add(setedObjs[j], 'sj-obj-box');
		/* 담는 상자 pool에 등록*/
		sj.getBoxObjs().push(setedObjs[j]);

		/** 객체마다 적용(이벤트) **/
		var eventFn = setedObjs[j].getAttribute('data-event-boxinout');
		if (eventFn != null && eventFn != undefined){
			/* 이벤트 함수 만들기 */			
			setedObjs[j].executeEventBoxinout = new Function('box','obj','boxSize', eventFn);
		}
		var eventFn = setedObjs[j].getAttribute('data-event-start');
		if (eventFn != null && eventFn != undefined){
			/* 이벤트 함수 만들기 */			
			setedObjs[j].executeEventStart = new Function('box','obj','boxSize', eventFn);
			/* 이벤트 바로 실행 */
			setedObjs[j].executeEventStart(setedObjs[j], undefined, sj.getMovableObjCount2(setedObjs[j]));
		}
		var eventFn = setedObjs[j].getAttribute('data-event-boxin');
		if (eventFn != null && eventFn != undefined){
			/* 이벤트 함수 만들기 */			
			setedObjs[j].executeEventBoxin = new Function('box','obj','boxSize', eventFn);
		}
		var eventFn = setedObjs[j].getAttribute('data-event-boxout');
		if (eventFn != null && eventFn != undefined){
			/* 이벤트 함수 만들기 */			
			setedObjs[j].executeEventBoxout = new Function('box','obj','boxSize', eventFn);
		}		
	}
	
	/** 객체마다 적용(고정되는 상자) **/
	var setedObjs = sjHelper.cross.querySelectorAll('[data-fixed]');
	for (var j=0; j<setedObjs.length; j++){
		if (setedObjs[j].isAdaptedFixed) continue;
		setedObjs[j].isAdaptedFixed = true;
		
		sjHelper.cross.classList.add(setedObjs[j], 'sj-obj-fixable');
		sj.getFixedObjs().push(setedObjs[j]);
		sjHelper.cross.addEventListener(document, 'scroll', function(event){sj.whenDocumentScroll(event);});
	}
	
	
	
	sj.whenResize();
}




















/*********************************************
 * 
 * 					핵심 기능들
 * 
 *********************************************/
function SJMouseGetPower(){
	this.isMobile = false;
	
	var mvObj;
	var mvObjStartBodyOffsetX;
	var mvObjStartBodyOffsetY;	
	var mvObjBeforePosition;
	var mvObjPreviewClone;
	var mvObjBeforeBox;
	var mvObjBeforeNextSibling;
	/* ie에서는 브라우저 밖에서 mouseup이 발생하지 않아 방지하기 위한 클론리스트 */
	var mvObjCloneList = [];
	var lastPosX;
	var lastPosY;	
	var isOnDown = false;
	var isOnMoving = false;
	
	var isOnPaintDown = false;
	var isOnPaintTouch = false;
	var paintLastPosX;
	var paintLastPosY;
	var paintLastLastPosX;
	var paintLastLastPosY;
	var paintTimer;

	var previewer;
	var boxObjs = [];
	var fixedObjs = [];
	
	this.isAdapted = false;
	
	var shiftKeyOnDown = false;
	var altKeyOnDown = false;
	
	
	this.getBoxObjs = function(){return boxObjs;};
	this.getFixedObjs = function(){return fixedObjs;};
	this.getIsOnMoving = function(){return isOnMoving;};	
	this.setPreviewer = function(obj){previewer = obj;};
	this.getPreviewer = function(){return previewer;};
	
	
	this.getMovableObjCount2 = function(box){
		return getMovableObjCount(box);
	};
	
	
	/*************************************************************
	 *  WHEN you start draging movable object
	 *************************************************************/
	this.whenMouseDown = function (event){
		isOnMoving = false;	
	};
	this.objStartMove = function (selectedObj, event){
		/*sjHelper.cross.stopPropagation(event);*/ //잠시 
		
		//있으면 MIE에서 이미지저장 덜 뜸
		//있으면 MFirefox에서 위아래 이동시 스크롤 되는 것 방지, 객체 이동이 원할, 대신 스크롤로직도 안됨
		//없으면 MChrome에서 스크롤판정로직이 자연스럽게 됨.  ==> 그래서 이미지는 DIV의 backgorund로 설정시키는 data-img 속성 추가로 MIE에서는 없어도 이미지저장이 안뜨게 함		
		// 임시방편 : 파이어폭스에서 스크롤로직이 안되더라도  preventDefault를 실행하기
		// 파이어폭스의 특수성 때문에 따로 이벤트 처리 / ★현재 파이어폭스에서만 무빙객체의 이동취소 후 스크롤 시키는 로직이 안됨!!!ㅠ  
		if (navigator.userAgent.indexOf('Firefox') != -1) sjHelper.cross.preventDefault(event);

		
		/* ★ IE8에서 이벤트 넣어줄때 this라고 쓴 부분에서 윈도우 객체를 잡아다 보낸다. 그럼 NONO 할 수 없이 srcElement를 씀(이동가능 객체의 자손이 존재할 때 자손만 가지고 오지만 이거라도)*/
		if (selectedObj != window){
			mvObj = selectedObj;
		}else{
			mvObj = sjHelper.cross.srcElement(event);
		}		
		
		/* 갈 곳 미리보기 클론 */
		mvObjPreviewClone = mvObj.cloneNode(true);		
		mvObjPreviewClone.setAttribute('data-movable', 'false'); //undefined, null, true, false를 지정하면 조건식에서 정상적으로 작동을 안함. 스트링으로
		sjHelper.cross.classList.add(mvObjPreviewClone, 'sj-preview-going-to-be-in-box');
		mvObjPreviewClone.style.position = "";
		
		/* ie브라우저를 벗어나서 mouseup이벤트가 발생하지 않는 것 때문에 클론이 지워지지 않는 것 방지 */
		mvObjCloneList.push(mvObjPreviewClone);
		
		/* 이동 전 정보 저장 */
		mvObjBeforeBox = mvObj.parentNode;
		mvObjBeforePosition = mvObj.style.position;		
		/*mvObjBeforeNextSibling = mvObj.nextElementSibling;*/
		mvObjBeforeNextSibling = mvObj.nextSibling;
				
		/* 현재 마우스/터치 위치를 전역에 저장 */
		setLastPos(event);
		
		/* Mobile Control */		
		if (event.touches != undefined){
			timerObj = event.touches[0].target;
			removeTimer();
			timer = setInterval(setTimer, 100);
			/* mvObjStartBodyOffset = body관점에서 대상객체의 offset */
			var mvObjStartBodyOffset = sjHelper.getBodyOffset(mvObj);
			mvObjStartBodyOffsetX = mvObjStartBodyOffset.x;
			mvObjStartBodyOffsetY = mvObjStartBodyOffset.y;
			/* mvObj.adjust = mouseDown을 시작한 곳과 대상객체의 offset과의 거리 */
			mvObj.adjustX = event.touches[0].pageX - mvObjStartBodyOffsetX 
			mvObj.adjustY = event.touches[0].pageY - mvObjStartBodyOffsetY
			return;
		}else{
		/* Web Control */			
			/* mvObjStartBodyOffset = body관점에서 대상객체의 offset */
			var mvObjStartBodyOffset = sjHelper.getBodyOffset(mvObj);
			mvObjStartBodyOffsetX = mvObjStartBodyOffset.x;
			mvObjStartBodyOffsetY = mvObjStartBodyOffset.y;				
			/* mvObj.adjust = mouseDown을 시작한 곳과 대상객체의 offset과의 거리 */			
			mvObj.adjustX = event.clientX - mvObjStartBodyOffsetX + sjHelper.cross.getBodyScrollX(); 
			mvObj.adjustY = event.clientY - mvObjStartBodyOffsetY + sjHelper.cross.getBodyScrollY();			
			/* mvObj의 이동을 허가하는  표시와 설정 */
			if (!isOnPaintDown) {
				sjHelper.cross.classList.add(mvObj, 'sj-obj-is-on-moving');
				isOnDown = true;
				isOnMoving = false;
			}
		}		
		
	};
	this.whenMouseMove = function (event){
		/* 페인트 이벤트가 ON이면, 객체이동 이벤트 취소 */
		if (isOnPaintDown) {
			isOnDown = false;
			sjHelper.cross.classList.remove(mvObj, 'sj-obj-is-on-moving');
		}
		/* 현재 마우스/터치 위치를 전역에 저장 */
		setLastPos(event);		
		/* 모바일 터치 이벤트 시행 중... 영역에서 벗어나면 드래그 카운터 취소 */		
		if (timerObj && !sjHelper.isInBox(timerObj, lastPosX, lastPosY)) removeTimer();
		
		if(isOnDown){			 
			sjHelper.cross.preventDefault(event);
			
//			p0.innerHTML = mvObj.style.left + '/'+ mvObj.style.top +'/'+ mvObj.style.position + '/';
			
			/** 가는 위치 미리 보여주기 **/
			var goingToBeInThisBox = getDecidedBox();			
			if ( goingToBeInThisBox!=undefined ){
				var canEnterWithoutNoLimit = ( goingToBeInThisBox.getAttribute("data-box") == '' );
				var canEnter = ( goingToBeInThisBox.getAttribute("data-box") > getMovableObjCount(goingToBeInThisBox) );
			}
			
			if ( goingToBeInThisBox==undefined ){
				/* 박스 밖으로 갈 예정 */
				if (mvObjPreviewClone.parentNode) mvObjPreviewClone.parentNode.removeChild(mvObjPreviewClone);
			}else if ( goingToBeInThisBox==mvObjBeforeBox || (!canEnterWithoutNoLimit && !canEnter) ) {
				/* 원위치로 지정 */
				mvObjBeforeBox.insertBefore(mvObjPreviewClone, mvObjBeforeNextSibling);				
				mvObjPreviewClone.style.position = mvObjBeforePosition;
			}else{
				/* 갈 예정인 박스안 지정 */
				goingToBeInThisBox.appendChild(mvObjPreviewClone);
				mvObjPreviewClone.style.position = "";
			}
			
			/** mvObj 이동하여 표시하기 **/
			/* X축 이동하기*/ 
	        if(lastPosX - mvObj.adjustX >= 1
	        && lastPosX - mvObj.adjustX + mvObj.offsetWidth <= document.body.offsetWidth) { 
	        	mvObj.style.left = (lastPosX - mvObj.adjustX) + 'px';	        	
	        }else{
	        /* X축 이동 제한*/
	        	if(lastPosX - mvObj.adjustX < 1) mvObj.style.left = 0 + 'px';
	        	if(lastPosX - mvObj.adjustX + mvObj.offsetWidth > document.body.offsetWidth)
	        		mvObj.style.left = (document.body.offsetWidth - mvObj.offsetWidth) + 'px';
	        }
	        /* Y축 이동하기 */ 
	        if(lastPosY - mvObj.adjustY >= 1
	        && lastPosY - mvObj.adjustY + mvObj.offsetHeight <= document.body.offsetHeight) { 
	        	mvObj.style.top = (lastPosY - mvObj.adjustY)  + 'px';
	        }else{
	        /* Y축 이동 제한 */
	        	if(lastPosY - mvObj.adjustY < 1) mvObj.style.top = 0 + 'px';
	        	if(lastPosY - mvObj.adjustY + mvObj.offsetHeight > document.body.offsetHeight){
	        		mvObj.style.top = (document.body.offsetHeight - mvObj.offsetHeight) + 'px';
	        	} 
	        } 
	        
	        
	        /** mvObj 이동중인 상태를 적용 **/
	        mvObj.style.position = 'absolute';	        
	        mvObj.style.float = '';
	        sjHelper.cross.classList.add(mvObj, 'sj-obj-is-on-moving');
	        document.body.appendChild(mvObj);
	        
	        /* 이동시 크기변이 또는 해당Layout의 scroll계산의 까다로움으로 인하여 mvObj의 영역에 마우스가 위치하지 않는 경우 마우스를 0점 위치로 */
	        if (!isOnMoving) {
	        	if (mvObj.adjustX > mvObj.offsetWidth || mvObj.adjustX < 0) mvObj.adjustX = mvObj.offsetWidth; 
	        	if (mvObj.adjustY > mvObj.offsetHeight || mvObj.adjustY < 0) mvObj.adjustY = mvObj.offsetHeight;
	        }
	        
	        /* 이동중 확정 */
		    isOnMoving = true;		    
		}	
		
	};
	this.whenMouseUp = function (event){
		/* 객체이동 준비 취소 */
		removeTimer();
		/* 페인팅 취소 */
		if (isOnPaintDown) {
			clearInterval(paintTimer);
			isOnPaintDown = false;			
		}
		/* 이동객체 상태 취소 */
		if (isOnDown) {
			sjHelper.cross.classList.remove(mvObj, 'sj-obj-is-on-moving');
			isOnDown = false;
		}
		
		/** 미리보기를 위한 mvObj클론 없애기 **/
		if (mvObjPreviewClone && mvObjPreviewClone.parentNode) {
			mvObjPreviewClone.parentNode.removeChild(mvObjPreviewClone);
		}
		/** IE브라우저 밖에서 mouseup해도 이벤트 발생이 되지 않아서 클론이 안 지워지는 것 방지 **/
		for (var pp=0; pp<mvObjCloneList.length; pp++){
			if (mvObjCloneList[pp].parentNode){
				mvObjCloneList[pp].parentNode.removeChild(mvObjCloneList[pp]);				
			}
		}
		/** 다시 정의하면 기존 메모리에 할당된건 지워주게지? **/
		if (mvObjCloneList.length > 3){
			mvObjCloneList = [];			
		}
		
		/* 아래는 이동중이던 객체에게 적용 */
		if (isOnMoving){
			/** mvObj가 이동할 박스객체 하나 선정 **/			
			var decidedBox = getDecidedBox();
			
			
			/** 결정된 박스에 mvObj넣기  **/
			if (decidedBox != undefined) {
				/* 다시 같은 상자면 원위치, 이동을 허가하지 않은 상자면 원위치*/
				var canEnterWithoutNoLimit = (decidedBox.getAttribute("data-box") == '');
				var canEnter = (decidedBox.getAttribute("data-box") > getMovableObjCount(decidedBox));
				if ( decidedBox==mvObjBeforeBox || (!canEnterWithoutNoLimit && !canEnter) ){
						mvObjBeforeBox.insertBefore(mvObj, mvObjBeforeNextSibling);
						mvObj.style.position = (mvObjBeforePosition=='absolute') ? 'absolute':''; 
						if (mvObjBeforePosition=='absolute'){
							mvObj.style.left = mvObjStartBodyOffsetX;
							mvObj.style.top = mvObjStartBodyOffsetY;
							mvObj.style.float = '';
						}
				}else{
				/* 다른 상자면 진행 */
					/* 정렬 */
					decidedBox.appendChild(mvObj);
					mvObj.style.position = '';
					/* 이벤트 실행(박스객체, 이동객체, 박스안 이동객체 수) */
					if (mvObjBeforeBox.executeEventMustDo) mvObjBeforeBox.executeEventMustDo();
					if (mvObjBeforeBox.executeEventBoxinout) mvObjBeforeBox.executeEventBoxinout(mvObjBeforeBox, mvObj, getMovableObjCount(mvObjBeforeBox));
					if (mvObjBeforeBox.executeEventBoxout) mvObjBeforeBox.executeEventBoxout(mvObjBeforeBox, mvObj, getMovableObjCount(mvObjBeforeBox));
					if (decidedBox.executeEventMustDo) decidedBox.executeEventMustDo();
					if (decidedBox.executeEventBoxinout) decidedBox.executeEventBoxinout(decidedBox, mvObj, getMovableObjCount(decidedBox));
					if (decidedBox.executeEventBoxin) decidedBox.executeEventBoxin(decidedBox, mvObj, getMovableObjCount(decidedBox));
				}
							
				/* 초기화 */
				mvObj = null;
				return;
			}
			
			/** 결정된 박스에 mvObj넣기 (밖 허가 안되면 위치 원상 복구, 허가면 이전 박스의 박스아웃 이벤트 발생)  **/
			if (mvObjBeforeBox.executeEventMustDo) mvObjBeforeBox.executeEventMustDo();
			if (mvObjBeforeBox.executeEventBoxinout) mvObjBeforeBox.executeEventBoxinout(mvObjBeforeBox, mvObj, getMovableObjCount(mvObjBeforeBox));
			if (mvObjBeforeBox.executeEventBoxout) mvObjBeforeBox.executeEventBoxout(mvObjBeforeBox, mvObj, getMovableObjCount(mvObjBeforeBox));
			
			/** confirm mvObj is out of the Box **/			
			/* 초기화 */
			mvObj = null;
			return;
		}	
	};
	
	
	
	/*************************************************************
	 *  WHEN mouse on box 
	 *************************************************************/
	this.objMouseOver = function (event){
	};
	this.objMouseOut = function (event){
		previewer.style.display = 'none';
	};
	this.objMouseMove = function (event){
		var obj;				
		/* Mobile Control */		
		if (event.touches != undefined){
			if (timerTime >= 3)	sjHelper.cross.preventDefault(event);	
			obj = event.touches[0].target;
		}else{
		/* Web Control */
			sjHelper.cross.preventDefault(event);
			obj = sjHelper.cross.srcElement(event);
		}		
		/*Web 적합*/
		previewer.style.left = lastPosX + 12 +'px';
		previewer.style.top = lastPosY + 2 +'px';		
		
		/* Mobile에 적합한 프리뷰 표시위치라고 생각했으나 아니다. 그냥 모바일에서 안뜨는게 제일이라고 생각해서 이벤트 없앴음 */
		/*var objBodyOffset = sjHelper.getBodyOffset(obj);
		objBodyOffsetX = objBodyOffset.x;
		objBodyOffsetY = objBodyOffset.y;		
		previewer.style.left = obj.offsetWidth + objBodyOffsetX;
		previewer.style.top = objBodyOffsetY;*/
		
		previewer.innerHTML = obj.getAttribute('data-previewer');
		previewer.style.display = 'block';		
	};		
	
	
	
	
	
	/********************************
	 *  paint의 이벤트 
	 ********************************/
	this.paintStart = function(event, cvs){
		sjHelper.cross.stopPropagation(event);
		sjHelper.cross.preventDefault(event);
		
		/* 작동되면 터치이동 준비 취소 */		
		clearTimeout(timer);
		isOnPaintDown = true;
		
		
		var canvasOffset = sjHelper.getBodyOffsetPainting(cvs);
		/* Mo Control */
		if (event.touches != undefined ){
			isOnPaintTouch = true;
			paintLastPosX = event.touches[0].pageX - canvasOffset.x;
			paintLastPosY = event.touches[0].pageY - canvasOffset.y;			 
		}else if (event.clientY){
			if(isOnPaintTouch) return;
			/* Web Control */
			paintLastPosX = (event.clientX + sjHelper.cross.getBodyScrollX()) - canvasOffset.x;
			paintLastPosY = (event.clientY + sjHelper.cross.getBodyScrollY()) - canvasOffset.y;
			
		}
		/* 마우스 찍은 위치 부터 */
		paintLastLastPosX = paintLastPosX;
		paintLastLastPosY = paintLastPosY;
		paintTimer = setInterval(
				function(){					
					// Draw lines
					var ctx = cvs.getContext('2d');
					ctx.lineWidth = 2;
					ctx.lineCap = "round";
					ctx.beginPath();
					ctx.moveTo(paintLastLastPosX, paintLastLastPosY);
					ctx.lineTo(paintLastPosX, paintLastPosY);
					ctx.strokeStyle = "rgb(0,0,0)";
					ctx.stroke();
					// Update coordinates 
					paintLastLastPosX = paintLastPosX;
					paintLastLastPosY = paintLastPosY;
					
				}
				, 16);
	};
	this.paint = function(event, cvs){
		if (!isOnDown && isOnPaintDown) {			
			/*sjHelper.cross.preventDefault(event);*/ // IE9에서만 문제 발생 & 모바일(IE,NAVER에서 짧게만 그어짐 / 나머지 위아래 스크롤이 방지가 안됨
			var canvasOffset = sjHelper.getBodyOffsetPainting(cvs);
			/* Mo Control */
			if (event.touches != undefined){
				sjHelper.cross.preventDefault(event);
				paintLastPosX = event.touches[0].pageX - canvasOffset.x;
				paintLastPosY = event.touches[0].pageY - canvasOffset.y;				
			}else if (event.clientY){
				if(isOnPaintTouch) return;				
				/* Web Control */
				paintLastPosX = (event.clientX + sjHelper.cross.getBodyScrollX()) - canvasOffset.x;
				paintLastPosY = (event.clientY + sjHelper.cross.getBodyScrollY()) - canvasOffset.y;
				/*p0.innerHTML = paintLastPosX + '//'  + paintLastPosY;*/
			}			
		}
	};
	this.paintEnd = function(event, cvs){
		clearInterval(paintTimer);
		isOnPaintDown = false;			
	};	
	
	
	
	/*************************************
	 * @author sj : 김수중  
	 * @date : 15. 04. 09
	 * @param obj는 원하는 div의 id
	 * 
	 * 천장에 고정!! 스크롤 이벤트 발생시 호출 시킨다.
	 *************************************/
	this.whenDocumentScroll = function (event){		
		removeTimer();		
//		sjHelper.cross.preventDefault(event);
		for (var j=0; j<fixedObjs.length; j++){
			var obj = fixedObjs[j];
			if (!obj.emptyDiv) obj.emptyDiv = document.createElement('div');			
			if (!obj.qMenuY && obj.style.position != 'fixed') obj.qMenuY = obj.offsetTop;
			
			/*천장에 닿으면*/
			if(0 > obj.qMenuY - sjHelper.cross.getBodyScrollY()){
				if (obj.style.position != 'fixed') {
					obj.emptyDiv.style.height = obj.offsetHeight + 'px';
					obj.parentNode.insertBefore(obj.emptyDiv, obj.nextSibling);
					sjHelper.cross.classList.add(obj, 'sj-obj-fixed');
					obj.style.top = 0 + 'px';
					obj.style.position = 'fixed';
				}
				
			/* 원위치 좌표로 돌아오면 천장에서 때기 */
			}else{					
				if (obj.style.position=='fixed') {
					if (obj.parentNode == obj.emptyDiv.parentNode) obj.parentNode.removeChild(obj.emptyDiv);
					sjHelper.cross.classList.remove(obj, 'sj-obj-fixed');
					obj.style.position = '';
					obj.style.top = obj.qMenuY + 'px';
				}
			}
		}		
	};
	/************************************
	 * 		When window is resized
	 ************************************/
	this.whenResize = function (event){
		/* 뷰어 중에 크기를 설정해야만 하는 것들 설정 */
		var setedObjs = sjHelper.cross.querySelectorAll('[data-type=assistant]');
		for (var j=0; j<setedObjs.length; j++){
			var assistant = setedObjs[j];
			var storage = assistant.children[0];
			var viewer = assistant.parentNode;
			var viewerType = viewer.getAttribute('data-type');
			/** storage 설정 **/
			if (storage 
			&& (viewerType=='slideview' || viewerType=='slideview-auto') ){								
				var storageWidth = 0;				
				for (var l=0; l<storage.children.length; l++){
					storage.children[l].style.width = assistant.offsetWidth + 'px';
					storageWidth += storage.children[l].offsetWidth + 10;					
				}			
				storage.style.width = storageWidth + 'px';
				if (viewerType=='slideview'){					
					assistant.scrollLeft = storage.children[storage.nowShowingChildIdx].offsetWidth * storage.nowShowingChildIdx ;
				}
			}
			if (viewerType=='scrollview' && storage){								
				var storageWidth = 0;				
				for (var l=0; l<storage.children.length; l++){
					storageWidth += storage.children[l].offsetWidth + 20;				
				}			
				if(storage.parentNode.offsetWidth < storageWidth){
					storage.style.width = (storageWidth + 50) + 'px';
				}else{
					storage.style.width = '100%';
				}
				
			}
		}
		
		/* 객체의 밑바닥을 브라우저 viewport범위에서 최하단까지 사이즈 늘이기 */
		var setedObjs = sjHelper.cross.querySelectorAll('[data-height-down]');
		for (var j=0; j<setedObjs.length; j++){
			var bodyOffset = sjHelper.getBodyOffset(setedObjs[j]);
			setedObjs[j].style.height = ((window.innerHeight) - bodyOffset.y - 10) +'px'; //window.innerHeight은 표준이니 모르겠다.
		}
			
		/* 스크롤 되었을 때를 실행 */ /*왜 안돼지?..*/
		this.whenDocumentScroll(event);		
	};
	
	
	/*************************************
	 * 스크롤 뷰의 이벤트
	 *************************************/
	this.whenTouchDownOnScrollview = function(event, slider) {
		/*sjHelper.cross.preventDefault(event);*/ //MOBILE NAVER, MOBILE IE에서 터치이동 준비를 전혀 못하게 함		
		slider.slideviewStartPointX = event.touches[0].screenX;
		slider.slideviewStartPointY = event.touches[0].screenY;
		slider.slideviewStartScrollX = slider.scrollLeft;
		slider.slideviewStartScrollY = document.body.scrollTop;
	};
	this.whenTouchMoveOnScrollview = function(event, slider) {
		slider.slideviewEndPointX = event.touches[0].screenX;
		slider.slideviewEndPointY = event.touches[0].screenY;
		slider.movedDistanceX = Math.abs(slider.slideviewEndPointX - slider.slideviewStartPointX);
		slider.movedDistanceY = Math.abs(slider.slideviewEndPointY - slider.slideviewStartPointY);		

		if (!isOnDown 
		&& slider.movedDistanceX > 5 
		&& slider.movedDistanceX > slider.movedDistanceY){
			sjHelper.cross.stopPropagation(event);
			/* 스크롤 작동되면 터치이동 준비 취소 */
			removeTimer();
		}
	};	
	this.whenTouchUpOnScrollview = function(event, slider) {
	};
	
	/*************************************
	 * 슬라이드 뷰의 이벤트
	 *************************************/
	this.whenMouseWheel = function(event, viewer){
		if (shiftKeyOnDown) {
			sjHelper.cross.preventDefault(event);
			
			/* 동시에 두개 이상의 슬라이드가 작동될 범위일 때, 
			 * stopPropagation을 이용하여 부모의 작동을 멈추게 하고 
			 * 가장 위에 있는 것만 작동한다.
			 * 하지만, 첫번째 또는 마지막 슬라이드인 상황에서는 동작에 따라 부모의 슬라이드도 고려한다. */				
			if (event.wheelDelta < 0
			&& viewer.storage.nowShowingChildIdx == viewer.storage.children.length -1){
				
			}else if (event.wheelDelta > 0
			&& viewer.storage.nowShowingChildIdx == 0){
				
			}else{
				sjHelper.cross.stopPropagation(event);
			}
			
			if (event.wheelDelta > 0) this.slideToRight(viewer.storage);
			if (event.wheelDelta < 0) this.slideToLeft(viewer.storage);
		}
	};
	this.whenKeyDown = function(event){
		if (event.keyCode == 16) shiftKeyOnDown = true;
		/*if (event.keyCode == 18) altKeyOnDown = true;*/
	};
	this.whenKeyUp = function(event){
		if (event.keyCode == 16) shiftKeyOnDown = false;
		if (event.keyCode == 18) altKeyOnDown = false;
	};
	
	this.whenTouchDownOnSlideview = function(event, slider) {		
		/*sjHelper.cross.preventDefault(event);*/ //MOBILE NAVER, MOBILE IE에서 터치이동 준비를 전혀 못하게 함		
		slider.slideviewStartPointX = event.touches[0].screenX;
		slider.slideviewStartPointY = event.touches[0].screenY;
		slider.slideviewStartScrollX = slider.scrollLeft;
		slider.slideviewStartScrollY = document.body.scrollTop;
	};
	this.whenTouchMoveOnSlideview = function(event, slider) {
		slider.slideviewEndPointX = event.touches[0].screenX;
		slider.slideviewEndPointY = event.touches[0].screenY;
		slider.movedDistanceX = Math.abs(slider.slideviewEndPointX - slider.slideviewStartPointX);
		slider.movedDistanceY = Math.abs(slider.slideviewEndPointY - slider.slideviewStartPointY);		

		if (!isOnDown 
		&& !isOnPaintDown
		&& slider.movedDistanceX > 5 
		&& slider.movedDistanceX > slider.movedDistanceY){
			
			/* 동시에 두개 이상의 슬라이드가 작동될 범위일 때, 
			 * stopPropagation을 이용하여 부모의 작동을 멈추게 하고 
			 * 가장 위에 있는 것만 작동한다.
			 * 하지만, 첫번째 또는 마지막 슬라이드인 상황에서는 동작에 따라 부모의 슬라이드도 고려한다. */
			var distanceX = slider.slideviewEndPointX - slider.slideviewStartPointX;
			var judgeDistanceX = 10;			
			if (-judgeDistanceX > distanceX
			&& slider.firstChild.nowShowingChildIdx == slider.firstChild.children.length -1){
				
			}else if (judgeDistanceX < distanceX
			&& slider.firstChild.nowShowingChildIdx == 0){
				
			}else{
				sjHelper.cross.stopPropagation(event);
			}
			
			
			
			sjHelper.cross.preventDefault(event);
			slider.isOnTryToSlide = true;
			/* 슬라이드 작동되면 터치이동 준비 취소 */
			removeTimer();
			if (!isOnDown){				
				slider.scrollLeft = slider.slideviewStartScrollX + (slider.slideviewStartPointX - slider.slideviewEndPointX);
			}else{
				this.slideToBack(slider.firstChild);
			}
		}
		/*p0.innerHTML = slider.movedDistanceX + ' / '+ slider.movedDistanceY;*/
	};	
	this.whenTouchUpOnSlideview = function(event, slider) {
		if(slider.isOnTryToSlide) {
			slider.isOnTryToSlide = false;
			var distanceX = slider.slideviewEndPointX - slider.slideviewStartPointX;
			var judgeDistanceX = slider.offsetWidth / 4;			
			if (-judgeDistanceX > distanceX){
				this.slideToLeft(slider.firstChild);
			}else if (judgeDistanceX < distanceX){
				this.slideToRight(slider.firstChild);
			}else{
				this.slideToBack(slider.firstChild);
			}
		}
	};
	/*************************************
	 * 슬라이드 뷰의 슬라이드 전환
	 *************************************/
	this.slideToRight = function(storage){
		this.slideTo(storage, storage.nowShowingChildIdx - 1);
	};	
	this.slideToLeft = function(storage){
		this.slideTo(storage, storage.nowShowingChildIdx + 1);
	};
	this.slideToBack = function(storage){
		storage.onSlideToBack = true;
		this.slideTo(storage, storage.nowShowingChildIdx);
	};
	this.slideTo = function(storage, idx){		
		/* storage가 가진 자식index보다 더 큰 걸 요구했을 경우, 다시 제자리로 */
		if (storage.children.length <= idx){
			this.slideTo(storage, storage.nowShowingChildIdx);
			return;
		}
		
		var moveToNextSlideInterval;
		var slider = storage.parentNode;
		var destinyObjWidth = storage.children[idx].offsetWidth * idx;
		var slideSpeed = 50;
		/* 오른쪽으로 이동 */
		if (slider.scrollLeft < destinyObjWidth){
			if(!slider.onSlide) moveToNextSlideInterval = setInterval(function(){
				slider.onSlide = true;
				if (slider.scrollLeft < destinyObjWidth) {
					slider.scrollLeft += slideSpeed;
				}else{
					slider.scrollLeft = destinyObjWidth;
					storage.nowShowingChildIdx = idx;
					clearInterval(moveToNextSlideInterval);
					sj.expressNowSlide(storage);
					slider.onSlide = false;
					/* 정상적으로 slide가 이동이 되면 발생하는 이벤트 */
					if (!storage.onSlideToBack){
						if (slider.parentNode.executeEventSlide){
							slider.parentNode.executeEventSlide(slider.parentNode, storage.children[idx], idx);
						}
						if (storage.children[idx].executeEventSlide){
							storage.children[idx].executeEventSlide(slider.parentNode, storage.children[idx], idx);
						}
					}
					storage.onSlideToBack = false;
				}
			}, 8);
		/* 왼쪽으로 이동 */
		}else if (slider.scrollLeft > destinyObjWidth){
			if(!slider.onSlide) moveToNextSlideInterval = setInterval(function(){
				slider.onSlide = true;
				if (slider.scrollLeft > destinyObjWidth){
					slider.scrollLeft -= slideSpeed;
				}else{
					slider.scrollLeft = destinyObjWidth;
					storage.nowShowingChildIdx = idx;
					clearInterval(moveToNextSlideInterval);
					sj.expressNowSlide(storage);
					slider.onSlide = false;
					/* 정상적으로 slide가 이동이 되면 발생하는 이벤트 */
					if (!storage.onSlideToBack){
						if (slider.parentNode.executeEventSlide){
							slider.parentNode.executeEventSlide(slider.parentNode, storage.children[idx], idx);
						}
						if (storage.children[idx].executeEventSlide){
							storage.children[idx].executeEventSlide(slider.parentNode, storage.children[idx], idx);
						}
					}
					storage.onSlideToBack = false;
				}
			}, 8);
		}
	};
	this.expressNowSlide = function(storage){		
		var viewerIndexList = storage.linkedViewerIndexList.children;
		var nowSlideIdx = storage.nowShowingChildIdx;
		for (var i=0; i<viewerIndexList.length; i++){
			sjHelper.cross.classList.remove(viewerIndexList[i], 'now-slide');
			if (i == nowSlideIdx) {
				sjHelper.cross.classList.add(viewerIndexList[i], 'now-slide');;
				
			}
		}
	};
	
	
	
	
	
	
	/********************
	 * 
	 *      부가적인 도우미 펑션들
	 * 
	 ********************/
	var setLastPos = function(event){
		/* Mobile Control */		
		if (event.touches != undefined){
			lastPosX = event.touches[0].pageX;
			lastPosY = event.touches[0].pageY;				
		}else{
		/* Web Control */
			lastPosX = event.clientX + sjHelper.cross.getBodyScrollX();
			lastPosY = event.clientY + sjHelper.cross.getBodyScrollY();
		}
	};
	
	/** 중첩된 상자객체들 중에서 하나만 선정하여 반환  **/
	var getDecidedBox = function(){
		var mvObjOnThisBoxObjs = [];
		var decidedBox;
		var decidedBoxLevel = 0;
		var decidedFixedBox;
		var decidedFixedBoxLevel = 0;
		
		/** 현재 마우스 위치의 박스객체 모으기 **/
		for (var i=0; i<boxObjs.length; i++){
			if(sjHelper.isInBox(boxObjs[i], lastPosX, lastPosY) && mvObj != boxObjs[i]){
				mvObjOnThisBoxObjs.push(boxObjs[i]);													
			}
		}
		
		/** 들어갈 박스 선정 **/		
		for (var i=0; i<mvObjOnThisBoxObjs.length; i++){			
			var parentObj = mvObjOnThisBoxObjs[i].parentNode;
			var domLevel = 0;
			var stopFlag = false;
			var flagIsFixed = false;
			
			/* 자신이  fixed이면 flagIsFixed=true */	
			if (mvObjOnThisBoxObjs[i].style.position=='fixed') flagIsFixed = true;	
						
			/* 상자의 domtree단계?? 파악하기 */
			while(parentObj){
				/* 박스가 mvObj의 자식이면 건너뛰기 */
				if (parentObj == mvObj) {
					stopFlag=true;
					break;
				}
				
				/* 부모의 영역에 가려진 부분이면 건너뛰기 */
				if (!sjHelper.isInBox(parentObj, lastPosX, lastPosY)				
				&& parentObj!=document.body.parentNode
				&& parentObj!=document.body.parentNode.parentNode) {
					stopFlag=true;
					break;
				}
				
				/* 조상 중에  fixed가 있다면 flagIsFixed=true */	
				if (parentObj.style && parentObj.style.position=='fixed') flagIsFixed = true;
				
				parentObj = parentObj.parentNode;
				domLevel++;					
			}
			/* 박스가 mvObj의 자식이면 건너뛰기 */
			if (stopFlag) continue;
			
			/* 중첩된 상자들 중에서 domtree단계가 가장 깊은 것으로 결정하기 */
			/* fixed된 객체에 우선권을 주기위해 fixed객체이거나 그의 자손일 때 따로 저장 */
			if (flagIsFixed){				
				if (decidedFixedBoxLevel < domLevel){				
					decidedFixedBoxLevel = domLevel;
					decidedFixedBox = mvObjOnThisBoxObjs[i];					
				}
			/* 일반의 경우 저장 */
			}else{
				if (decidedBoxLevel < domLevel){				
					decidedBoxLevel = domLevel;
					decidedBox = mvObjOnThisBoxObjs[i];					
				}  
			}
		}
		
		return (decidedFixedBox) ? decidedFixedBox : decidedBox;
	};
	
	/** 상자객체 안에 있는 무빙객체 수를 반환 **/
	var getMovableObjCount = function(box){
		var boxSize = 0;
		for (var j=0; j<box.children.length; j++){
			if (box.children[j].getAttribute('data-movable') != null
			&& box.children[j].getAttribute('data-movable') != undefined
			&& box.children[j].getAttribute('data-movable') != 'false'){
				boxSize++;
			}
		}		
		return boxSize;
	};	
	
	
	
	
	
	/** 모바일에서 길게 눌러야 객체를 이동시킬 수 있게 하기 위한 장치 **/
	var timerTime = 0;
	var timeForReadyToDrag = 300; 
	var timer;
	var timerObj;

	var setTimer = function(){
		/* 모바일에서 페인트 이벤트가 ON이면, 터치준비 이벤트 취소 */
		if (isOnPaintDown) clearTimeout(timer);		
		/* 100밀리세컨드 단위로 흐르는 시간 */
		timerTime += 100;		
		if (timerTime >= timeForReadyToDrag){
			sjHelper.cross.preventDefault(event);		//MCHROME에서 이게 있어야함. MIE에선 이게 있으면 안됨... 아 모르겠다.
			sjHelper.cross.classList.add(mvObj, 'sj-obj-is-on-moving');		
			isOnDown = true;
			isOnMoving = false;
			clearTimeout(timer);			
			timerTime = 0;
			
		}
	};
	var removeTimer = function(){
		/* 객체 길게 누름 관련 */
		clearTimeout(timer);
		timerTime = 0;		
	};
}























/*********************************** 
 * 				공통 모듈 
 ***********************************/
function SJMouseGetPowerHelper(){
	/************************************************** 
	 * 			IE6, IE7, IE8, IE9, Firefox를 위한 배려 
	 * sjHelper.cross.addEventListener(el, newEventName, fn);
	 * sjHelper.cross.preventDefault(event);
	 * sjHelper.cross.stopPropagation(event);
	 * sjHelper.cross.srcElement(event);
	 * sjHelper.cross.classList.add(el, classItem);
	 * sjHelper.cross.classList.remove(el, classItem);
	 * sjHelper.cross.querySelectorAll(selector);
	 * sjHelper.cross.getBodyScrollX();
	 * sjHelper.cross.getBodyScrollY();
	 * sjHelper.cross.disableSelection(el);
	 **************************************************/	
	var addEventListener = function(el, newEventName, fn, bl){
		/* FireFox는 이 작업을 선행하게하여 window.event객체를 전역으로 돌려야한다.*/
		if (navigator.userAgent.indexOf('Firefox') != -1) {			
			el.addEventListener(newEventName, function(e){window.event=e;}, true);
		}
		/* 일반 */
		if(el.addEventListener){			
			el.addEventListener(newEventName, fn)
		}else{
			el.attachEvent('on'+newEventName, fn);
		}
	};
	var preventDefault = function(event){
		if(event && event.preventDefault){
			event.preventDefault();
		}else{			
		}
	};
	var stopPropagation = function(event){
		if(event && event.stopPropagation){
			event.stopPropagation();
		}else{
			event.returnValue = false; 
			event.cancelBubble = true;
		}
	};
	var srcElement = function(event){
		if(event && event.srcElement){
			return event.srcElement;
		}else{			
			return event.target;
		}
	};
	var classList = { 		
			add: function(el, classItem){
					if (el.classList){
						el.classList.add(classItem);
					}else{
						el.className += ' ' +classItem+ ' ';
					}
				 }
		,	remove: function(el, classItem){
						if (el.classList){
							el.classList.remove(classItem);
						}else{
							while (el.className.indexOf(' ' +classItem+ ' ') != -1){
								el.className = el.className.replace(classItem + ' ', '');
							}		
							if (el.className.indexOf(classItem+ ' ') == 0){
								el.className = el.className.replace(classItem+ ' ', '');
							}
							if (el.className.indexOf(' ' +classItem) == el.className.length - classItem.length - 1){
								el.className = el.className.replace(' ' +classItem, '');
							}
						}
					}
	};	
	var querySelectorAll = function(selector){
		if(document.querySelectorAll){
			return document.querySelectorAll(selector);
		}else if(document.getElementsByTagName){
			/* Attribute */			
			var startIdx = selector.indexOf('[');
			var endIdx = selector.indexOf(']');
			var attr;
			var selectedList = [];
			if (startIdx != -1 && endIdx != -1){
				attr = selector.substring(startIdx +1, endIdx);
				/* 유효성검사에 맞는 Form 태그 들만 */
				var nodeNames = ['div', 'span', 'form', 'input', 'select', 'textarea'];
				for (var searchI=0; searchI< nodeNames.length; searchI++){
					var elements = document.getElementsByTagName(nodeNames[searchI]);					
					for (var searchJ=0; searchJ<elements.length; searchJ++){						
						if (elements[searchJ].getAttribute(attr) != undefined){
							selectedList.push(elements[searchJ]);
						}
					}
				}
			}
			return selectedList;		
		}
	};
	/*****
	 * 문서의 스크롤된 수치 반환
	 * IE8 : document.documentElement.scrollLeft 
	 * IE9 : window.pageXOffset 
	 * IE11 & others : document.body.scrollLeft 
	 *****/
	var getBodyScrollX = function(){
		var bodyPageX = 0;
		if (document.documentElement 
		&& document.documentElement.scrollLeft) bodyPageX = document.documentElement.scrollLeft;
		if (window.pageXOffset) bodyPageY = window.pageXOffset;
		if (document.body 
		&& document.body.scrollLeft) bodyPageX = document.body.scrollLeft;
		return bodyPageX;
	};
	var getBodyScrollY= function(){
		var bodyPageY = 0;
		if (document.documentElement
		&& document.documentElement.scrollTop) bodyPageY = document.documentElement.scrollTop;
		if (window.pageYOffset) bodyPageY = window.pageYOffset;
		if (document.body 
		&& document.body.scrollTop) bodyPageY = document.body.scrollTop;
		return bodyPageY;
	};
	var disableSelection = function (el){
		if (typeof el.ondragstart != 'undefined') el.ondragstart = function(){return false;};
		if (typeof el.onselectstart != 'undefined') el.onselectstart = function(){return false;};
		if (typeof el.oncontextmenu != 'undefined') el.oncontextmenu = function(){return false;};
		/* 파이어폭스에서 드래그 선택 금지 */
		if (typeof el.style.MozUserSelect != 'undefined') document.body.style.MozUserSelect = 'none';
	};
	this.cross = {
			addEventListener: addEventListener		
		,	preventDefault: preventDefault
		,   stopPropagation: stopPropagation
		,	srcElement: srcElement
		,	classList: classList
		,	querySelectorAll: querySelectorAll
		,	getBodyScrollX: getBodyScrollX
		,	getBodyScrollY: getBodyScrollY
		,	disableSelection: disableSelection
	};
	
	
	
	
	/*****
	 * 기타 공통 모듈
	 *****/
	/* 모바일여부 확인 */
	this.isMobile = function(){
		/** 모바일여부 확인 **/
	    var mFilter = "win16|win32|win64|mac";
	    var mCheck = false;
	    if(navigator.platform) mCheck = ( mFilter.indexOf(navigator.platform.toLowerCase())<0 ) ? true : false;
	    return mCheck; 
	};
	
	
	/* CREATE NEW DIV */
	this.getNewDiv = function (idVal, classVal, inner){
		var newDiv = document.createElement('div');
		newDiv.id = idVal;
		newDiv.setAttribute('class', classVal);
		newDiv.innerHTML = inner;
		return newDiv;
	};
	
	/* SEARCHING EMPTY ID */
	this.getNewSeqId = function (idStr){
		for (var seq=1; seq < 50000; seq++){
			var searchEmptyId = idStr + seq
			if (!document.getElementById(searchEmptyId)) return searchEmptyId;
		}		
		return null;
	};
	
	/* X,Y가 영역 안에 존재하는지 확인
	 * 의존 : getBodyOffset()  */
	this.isInBox = function (target, objX, objY){		
		var targetBodyOffset = this.getBodyOffset(target);
		var targetBodyOffsetX = targetBodyOffset.x;
		var targetBodyOffsetY = targetBodyOffset.y;

		/* 문서 영역을 벗어났을 때 보정 */
		objX = (objX <= 1) ? 1 : objX
		objX = (objX > document.body.offsetWidth) ? document.body.offsetWidth : objX
		objY = (objY <= 1) ? 1 : objY
		objY = (objY > document.body.offsetHeight) ? document.body.offsetHeight : objY
				
		/* 상자 안인지 판정 */		
		if(targetBodyOffsetX + target.scrollLeft< objX
		&& targetBodyOffsetX + target.offsetWidth + target.scrollLeft> objX
		&& targetBodyOffsetY + target.scrollTop< objY
		&& targetBodyOffsetY + target.offsetHeight + target.scrollTop > objY){
			return true;		
		}
		return false;		
	};
	
	/* 눈에 보이는 좌표 값 (객체마다  DOM TREE구조와 position의 영향을 받기 때문에, 다른 계산이 필요하여 만든 함수)
	 * 재료는 DOM객체 */
	this.getBodyOffset = function (objTemp){
		var sumOffsetLeft = 0;
		var sumOffsetTop = 0;
		var thisObj = objTemp;
		var parentObj = objTemp.parentNode;
		
		while(parentObj){
			if (parentObj!=document.body.parentNode.parentNode
			&& parentObj!=document.body.parentNode.parentNode.parentNode) {
				
				var scrollX = 0;
				var scrollY = 0;
				if (thisObj != document.body){
					scrollX = thisObj.scrollLeft;
					scrollY = thisObj.scrollTop;					
				}
				
				if (parentObj.style.position == 'absolute') {
					sumOffsetLeft += thisObj.offsetLeft - scrollX;
					sumOffsetTop += thisObj.offsetTop - scrollY;;					
				}else if(parentObj.style.position == 'fixed' || thisObj.style.position == 'fixed'){
					sumOffsetLeft += thisObj.offsetLeft + sjHelper.cross.getBodyScrollX();
					sumOffsetTop += thisObj.offsetTop + sjHelper.cross.getBodyScrollY();
					break;
				}else{	
					sumOffsetLeft += (thisObj.offsetLeft - parentObj.offsetLeft) - scrollX;
					sumOffsetTop += (thisObj.offsetTop - parentObj.offsetTop) - scrollY;					
				}				
				
			}			
			thisObj = parentObj;
			parentObj = parentObj.parentNode;			
		}
		
		var objBodyOffset = {x:sumOffsetLeft, y:sumOffsetTop};
		return objBodyOffset;
	};
	
	
	this.getBodyOffsetPainting = function (paintObj){
		var sumOffsetLeft = 0;
		var sumOffsetTop = 0;
		var thisObj = paintObj;
		var parentObj = paintObj.parentNode;
		
		while(parentObj){
			if (parentObj!=document.body.parentNode.parentNode
			&& parentObj!=document.body.parentNode.parentNode.parentNode) {
				
				var scrollX = 0;
				var scrollY = 0;
				if (thisObj != document.body){
					scrollX = thisObj.scrollLeft;
					scrollY = thisObj.scrollTop;					
				}
				
				if (parentObj.style.position == 'absolute') {
					sumOffsetLeft += thisObj.offsetLeft;
					sumOffsetTop += thisObj.offsetTop;					
				}else if(parentObj.style.position == 'fixed' || thisObj.style.position == 'fixed'){
					sumOffsetLeft += thisObj.offsetLeft + sjHelper.cross.getBodyScrollX();
					sumOffsetTop += thisObj.offsetTop + sjHelper.cross.getBodyScrollY();
					break;
				}else{
					sumOffsetLeft += (thisObj.offsetLeft - parentObj.offsetLeft) - scrollX;
					sumOffsetTop += (thisObj.offsetTop - parentObj.offsetTop) - scrollY;					
				}		
			}			
			thisObj = parentObj
			parentObj = parentObj.parentNode;			
		}
		
		var objBodyOffset = {x:sumOffsetLeft, y:sumOffsetTop};
		return objBodyOffset;
	};	
	
}

