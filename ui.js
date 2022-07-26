var mapaActual
var mapaPrevio
var resultado
var vidas

//Se crea una instancia para cada audio
var conteo = new Audio('audio/conteo.mp3')
var explosion = new Audio('audio/explosion2.mp3')
var cancion_de_fondo= new Audio('audio/it_starts_here.mp3')
var cancion_de_victoria= new Audio('audio/victory.mp3')
cancion_de_fondo.volume = 0.5

//Se capturan los modales
var modal_bienvenida= new bootstrap.Modal(document.getElementById("bienvenida"))
var modal_win = new bootstrap.Modal(document.getElementById("modal_win"))
var modal_lose = new bootstrap.Modal(document.getElementById("modal_lose"))

var botonJugar= document.getElementById("botonJugar")
var nuevo_juego= document.getElementById("nuevo_juego")
var comp_escrito=document.getElementById("comp_escrito")
var controles=document.getElementById("controles")

//Capturar el volumen de la musica
//var volumen = document.getElementById("rangeMusica")

const DELAY_IN_MS = 3000

// GAME DATA

var mapaInicial = `
0000#
00000
00000
00000
+0000`
var mapaMinas = `
0000#
$0$$0
$0$00
0$00$
+00$$`

//Funcion para mostrar un elemento html
function mostrar(elemento) {
	elemento.style.display = 'initial'
}
function mostrarGrupo(elemento){
	elemento.style.visibility = 'visible'
}

//Funcion para ocultar un elemento html
function ocultar(elemento) {
	elemento.style.display = 'none'
}
//Funcion para ocultar un grupo de elementos html
function ocultarGrupo(elemento) {
	elemento.style.visibility = 'hidden'
}
//Mostrar modal de bienvenida
modal_bienvenida.show() //muestra el modal
ocultar(nuevo_juego) //oculta el boton de nuevo juego
ocultarGrupo(comp_escrito) //oculta el componente escrito de la pantalla de juego
ocultarGrupo(controles) //oculta los controles de la pantalla de juego

botonJugar.addEventListener('click', comenzarJuego)
nuevo_juego.addEventListener('click', finalizarJuego)
nuevo_juego.addEventListener('click', comenzarJuego)

function comenzarJuego() {
	//Se ocultan y muestran algunos botones
	ocultar(botonJugar)
	mostrarGrupo(comp_escrito)
	mostrarGrupo(controles)
	mostrar(nuevo_juego)
	cancion_de_fondo.play()
	reset()
	escuchar()
	renderizar(mapaActual)
}



function ui_mover(event) {
	mapaPrevio = mapaActual

	var action
	var type = event.type
	if (type === 'keydown') {
		switch(event.code) {
		case 'ArrowUp':
		case 'KeyW':
			action = 'up'
			break
		case 'ArrowLeft':
		case 'KeyA':
			action = 'left'
			break
		case 'ArrowDown':
		case 'KeyS':
			action = 'down'
			break
		case 'ArrowRight':
		case 'KeyD':
			action = 'right'
			break
		default:
			return
		}
	} else if (type == 'click') {
		var control = event.target.closest('a')
		if (!document
			  .querySelector('#controles')
			  .contains(control)) {
			return
		}

		switch (control.id) {
		case 'controlU':
			action = 'up'
			break
		case 'controlL':
			action = 'left'
			break
		case 'controlR':
			action = 'right'
			break
		case 'controlD':
			action = 'down'
			break
		default:
			return
		}
	}

	mapaActual = mover(action, mapaPrevio, mapaMinas)
	resultado = obtenerResultado(mapaActual, mapaPrevio)
	mostrarMov(action)
	setTimeout(confirmarMov, DELAY_IN_MS)
}

//actualiza la posicion del robot en el mapa y los labels de la pantalla
function renderizar(mapa) {

	mapa = obtenerMatrixDeMapa(mapaActual)
	var tfilas = document.querySelectorAll('#camino_explosivo tr')
	for (var i = 0; i < mapa.length; i++) {
		var tdata = tfilas[i].querySelectorAll('td')
		for (var j = 0; j < mapa[i].length; j++) {
			var val = mapa[i][j]
			var elem = tdata[j]

			switch(val) {
			case '0':
				elem.innerHTML = ''
				break
			case '+':
				elem.innerHTML = '<img class="img-fluid" id="robot" src="./img/robot.png" />'
				break
			case '#':
				elem.innerHTML = '<img class="img-fluid" src="./img/person.png" />'
				break
			case '$':
				elem.innerHTML = '<img class="img-fluid" src="./img/bomb.png" />'
				break
			}
		}
	}

	document.querySelector('#vidas span').textContent = vidas

	var ret = document.querySelector('#res div:nth-child(2)')
	switch(resultado) {
		case 'sin mina':
			ret.innerHTML = '<div class="text-success">😌Nada por acá</div>'
			break
		case 'mina':
			ret.innerHTML = '<div class="text-danger">💣¡BOOM!</div>'
			break
		default:
			ret.innerHTML = '<div class="text-secondary">' + resultado + '</div>'
	}
}

function reset() {
	mapaActual = mapaInicial
	mapaPrevio = mapaInicial
	resultado = ''
	vidas = 3
}

function finalizarJuego() {
	mostrar(botonJugar)
	document.querySelectorAll('#camino_explosivo img').forEach((img) => { ocultarGrupo(img) })

	ocultarGrupo(comp_escrito)
	ocultarGrupo(controles)
	ocultar(nuevo_juego)
	silenciar()
}

function mostrarMov(mov) {
	silenciar()
	setTimeout(countdown(), 0);
	ocultar(nuevo_juego)
	document.querySelector('#res div:nth-child(2)').textContent = ''
	ocultarGrupo(controles)
	document.querySelector('#robot').src = 'img/' + mov + '.png' //mostrar flecha en vez del robot
	document.querySelector('#lightbox').classList.remove('lbox-collapse')
}

function confirmarMov() {
	mostrar(nuevo_juego)
	mostrarGrupo(controles)
	document.querySelector('#lightbox').classList.add('lbox-collapse')
	
	var ret = resultado
	
	var listen = true
	if (ret === 'mina') {
		setTimeout(() => explosion.play(), 0)
		vidas--
		if (vidas === 0) {
			modal_lose.show()
			finalizarJuego()
			
			listen = false
		} 
	} else if (ret === 'fin') {
		cancion_de_victoria.play() //musica de victoria
		modal_win.show()
		finalizarJuego()
		
		listen = false
	} 
	if (listen) {
		escuchar()
	}
	renderizar(mapaActual)
}

function escuchar() {
	//escuchar teclas
	document.querySelector('#cuerpo')
	  .addEventListener('keydown', ui_mover)
	;[...document.querySelectorAll('#controles a')]
	  .forEach((control) => control.addEventListener('click', ui_mover))
}

function silenciar() {
	document.querySelector('#cuerpo')
	  .removeEventListener('keydown', ui_mover)
	;[...document.querySelectorAll('#controles a')]
	  .forEach((control) => control.removeEventListener('click', ui_mover))
}

function countdown() {
	var ms = DELAY_IN_MS;
	return callback;

	function callback() {
		if (ms === 3000) {
			setTimeout(() => conteo.play(), 0)
		}

		var cont = document.querySelector('#res div:nth-child(2)')
		cont.textContent = parseInt(ms / 1000)

		ms -= 1000
		if (ms !== 0) {
			setTimeout(callback, 1000)	
		} 
	}
}


