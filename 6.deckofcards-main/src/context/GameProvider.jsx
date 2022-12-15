import { useState } from 'react';
import DeckOfCardsAPI from '../services/deckofcardsapi';
import GameContext from './GameContext';

const GameProvider = ({ children }) => {
	const [idGame, setIdGame] = useState(null);
	const [setWin] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const [winName, ] = useState('');
	const [playerOne, setPlayerOne] = useState({
		name: '',
		cards: [],
	});
	const [playerTwo, setPlayerTwo] = useState({
		name: '',
		cards: [],
	});

	const playGame = async () => {
		setIdGame(await DeckOfCardsAPI.getIdGame());
	};

	const requestCards = async () => {
		const cards = await DeckOfCardsAPI.getCards(idGame);

		cards[0].code = convertirValorCarta(cards[0].code)
		cards[1].code = convertirValorCarta(cards[1].code)

		setPlayerOne({ ...playerOne, cards: [...playerOne.cards, cards[0]] });
		setPlayerTwo({ ...playerTwo, cards: [...playerTwo.cards, cards[1]] });


		/**
		 * - Variable res trae la respuesta de la evaluacion del metodo
		 * {
		 * 		encontro = true/false // si encontro la terna o cuarta
		 * 		cartasCopia = [] // cartas que faltan por evaluar si tienen ternas
		 * 							o cuartas
		 * }
		 * - Si se encuentra una cuarta de escalera no va a buscar la terna
		 * 	con numero iguales
		 * 
		 * - Primero busca la cuarta que tiene mas prioridad y elimina 
		 * esas cartas de un array temporal, para pasarsela a los demas 
		 * validar para que solo trabajen con ellas y no se repitan 
		 * ternas o cuartas
		 * -
		 *  */


		// JUGADOR 1
		// Se valida dos veces terna porque es la condicion para ganar
		let res = validarCuartaEscalera(playerOne.cards, playerOne.name)
		if (!res.encontro) {
			res = validarCuartaguales(res.cartasCopia, playerOne.name)
		}

		res = validarTernaEscalera(res.cartasCopia, playerOne.name)
		if (!res.encontro) {
			res = validarTernaIguales(res.cartasCopia, playerOne.name)
		}

		res = validarTernaEscalera(res.cartasCopia, playerOne.name)
		if (!res.encontro   ) {
			res = validarTernaIguales(res.cartasCopia, playerOne.name)
		}

		// JUGADOR 2
		// Se valida dos veces terna porque es la condicion para ganar
		res = validarCuartaEscalera(playerTwo.cards, playerTwo.name)
		if (!res.encontro) {
			res = validarCuartaguales(res.cartasCopia, playerTwo.name)
		}

		res = validarTernaEscalera(res.cartasCopia, playerTwo.name)
		if (!res.encontro) {
			res = validarTernaIguales(res.cartasCopia, playerTwo.name)
		}

		res = validarTernaEscalera(res.cartasCopia, playerTwo.name)
		if (!res.encontro) {
			res = validarTernaIguales(res.cartasCopia, playerTwo.name)
		}

		console.log(playerOne)
		console.log(playerTwo)

	};

	const convertirValorCarta = (carta = "") => {
		/**
		 * Convierte las letras en numeros para manejarlos mejor
		 */
		let valorADevolver = ""
		switch (carta.charAt(0)) {
			case "A":
				valorADevolver = "1"
				break;
			case "0":
				valorADevolver = "10"
				break;
			case "J":
				valorADevolver = "11"
				break;
			case "Q":
				valorADevolver = "12"
				break;
			case "K":
				valorADevolver = "13"
				break;
			default:
				valorADevolver = carta.charAt(0)
				break;
		}
		return valorADevolver
	}

	const validarCuartaguales = (cartas = [], jugador = "") => {

		/**
		 * Valida si hay una cuarta en escalera
		 */
		console.log("Validando cuarta iguales")
		const cartasCopia = [...cartas] // Copia de las cartas para no modificar las originales
		let letraTerna = "" // letra o numero con que se formo la cuarta
		let contadorTerna = 0 // contados
		let encontro = false // Si encontro cuarta

		// compara contra si mismo si exiten las cartas para formar la terna
		// excepto si las posiciones i j son iguales 
		for (let i = 0; i < cartasCopia.length; i++) {
			contadorTerna = 0
			for (let j = 0; j < cartasCopia.length; j++) {

				if (i != j && cartasCopia[i].code == cartasCopia[j].code) {
					contadorTerna += 1
					letraTerna = cartasCopia[i].code
				}

			}
			if (contadorTerna >= 3) {
				break
			}
		}

		if (contadorTerna >= 3) {
			encontro = true
			alert("Hay una cuarta con el numero - " + letraTerna + " - " + jugador)

			// eliminar cuarta de la copia de cartas del jugador para posteriores metodos

			// Elimina las cartas del arrayCopia para pasarsela al siguiente validar
			for (let i = 0; i <= contadorTerna; i++) {
				let indexx = 0
				cartasCopia.find((item, index) => {
					if (parseInt(item.code) == parseInt(letraTerna)) {
						indexx = index
					}
				})
				cartasCopia.splice(indexx, 1)
			}

		}

		console.log("----------------------------------------------------")
		console.table(cartasCopia)

		console.log("FIN Validando cuarta iguales")
		return { encontro, cartasCopia }
	}

	const validarCuartaEscalera = (cartas = [], jugador = "") => {
		console.log("Validando cuarta escalera")
		let cartasCopia = [...cartas] // copia de las cartas
		cartasCopia = cartas.sort((a, b) => parseInt(a.code) - parseInt(b.code)) // Ordenar las cartass

		let encontro = false // si encontro escalera

		for (let i = 0; i < cartasCopia.length; i++) {
			try {
				let cartaAComparar = parseInt(cartasCopia[i].code);

				// Valida si exiten numeros consecutivos sumando 1 2 o 3 a cartaAComparar
				// para formar la escalera
				if (cartasCopia.find(item => parseInt(item.code) == (cartaAComparar + 1)) &&
					cartasCopia.find(item => parseInt(item.code) == (cartaAComparar + 2)) &&
					cartasCopia.find(item => parseInt(item.code) == (cartaAComparar + 3))) {

					// Eliminar carta usadas para la cuarta

					let indexx = 0

					// Busca la posicion del elemento a eliminar por que ya se formo la escalera
					// con ese numero
					cartasCopia.find((item, index) => {
						if (parseInt(item.code) == (cartaAComparar)) {
							indexx = index
						}
					})
					cartasCopia.splice(indexx, 1) // elimina el numero
					console.log(cartasCopia)

					cartasCopia.find((item, index) => {
						if (parseInt(item.code) == (cartaAComparar + 1)) {
							indexx = index
						}
					})
					cartasCopia.splice(indexx, 1)
					console.log(cartasCopia)

					cartasCopia.find((item, index) => {
						if (parseInt(item.code) == (cartaAComparar + 2)) {
							indexx = index
						}
					})
					cartasCopia.splice(indexx, 1)
					console.log(cartasCopia)

					cartasCopia.find((item, index) => {
						if (parseInt(item.code) == (cartaAComparar + 3)) {
							indexx = index
						}
					})
					cartasCopia.splice(indexx, 1)
					console.log(cartasCopia)

					alert("Hay una escalera de cuartas, jugador - " + jugador)
					encontro = true
					setWin(true);
					setShowToast(true);
				}

				if (encontro) {
					break
				}

			} catch (error) {
				continue;
			}
		}
		console.log("FIN Validando cuarta escalera")
		return { encontro, cartasCopia }
	}

	const validarTernaEscalera = (cartas = [], jugador = "") => {
		console.log("Validando terna escalera")
		let cartasCopia = [...cartas]
		cartasCopia = cartas.sort((a, b) => parseInt(a.code) - parseInt(b.code))

		let encontro = false

		for (let i = 0; i < cartasCopia.length; i++) {
			try {
				let cartaAComparar = parseInt(cartasCopia[i].code);
				if (cartasCopia.find(item => parseInt(item.code) == (cartaAComparar + 1)) &&
					cartasCopia.find(item => parseInt(item.code) == (cartaAComparar + 2))) {

					// Eliminar carta usadas para la cuarta

					let indexx = 0
					cartasCopia.find((item, index) => {
						if (parseInt(item.code) == (cartaAComparar)) {
							indexx = index
						}
					})
					cartasCopia.splice(indexx, 1)
					console.log(cartasCopia)

					cartasCopia.find((item, index) => {
						if (parseInt(item.code) == (cartaAComparar + 1)) {
							indexx = index
						}
					})
					cartasCopia.splice(indexx, 1)
					console.log(cartasCopia)

					cartasCopia.find((item, index) => {
						if (parseInt(item.code) == (cartaAComparar + 2)) {
							indexx = index
						}
					})
					cartasCopia.splice(indexx, 1)
					console.log(cartasCopia)

					alert("Hay una escalera de ternas, jugador - " + jugador)
					encontro = true
				}

				if (encontro) {
					break
				}

			} catch (error) {
				continue;
			}
		}

		console.log("FIN Validando terna escalera")
		return { encontro, cartasCopia }
	}

	const validarTernaIguales = (cartas = [], jugador = "") => {
		console.log("Validando terna iguales")
		const cartasCopia = [...cartas]
		let letraTerna = ""
		let contadorTerna = 0
		let encontro = false

		for (let i = 0; i < cartasCopia.length; i++) {
			contadorTerna = 0
			for (let j = 0; j < cartasCopia.length; j++) {

				if (i != j && cartasCopia[i].code == cartasCopia[j].code) {
					contadorTerna += 1
					letraTerna = cartasCopia[i].code
				}
			}
			if (contadorTerna >= 2) {
				break
			}
		}

		if (contadorTerna >= 2) {
			encontro = true
			alert("Hay una terna con el numero - " + letraTerna + " - " + jugador)

			// eliminar cuarta de la copia de cartas del jugador para posteriores metodos

			for (let i = 0; i <= contadorTerna; i++) {
				let indexx = 0
				cartasCopia.find((item, index) => {
					if (parseInt(item.code) == parseInt(letraTerna)) {
						indexx = index
					}
				})
				cartasCopia.splice(indexx, 1)
			}
		}

		console.log("----------------------------------------------------")
		console.table(cartasCopia)

		console.log("FIN Validando terna iguales")
		return { encontro, cartasCopia }

	}

	return (
		<GameContext.Provider
			value={{
				playGame,
				requestCards,
				playerOne,
				setPlayerOne,
				playerTwo,
				setPlayerTwo,
				showToast,
				setShowToast,
				winName,
			}}
		>
			{children}
		</GameContext.Provider>
	);
};

export default GameProvider;
