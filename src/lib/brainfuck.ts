/**
 * Brainfuck executor
 *
 * Since there are multiple "flavors" of Brainfuck that have different behavior
 * in terms of cell size, overflow/underflow, and moving to the left of the
 * start, this executor tries to support only the most limited version of
 * Brainfuck:
 * 
 *   - Cells are limited to [0, 255]
 *   - Rather than wrapping, or silently doing nothing, an exception is thrown
 *     when incrementing a cell with 255 or decrementing one with the value 0
 *   - Moving to the left of the start is not supported, and likewise triggers
 *     an exception
 *   - Behavior when the end of the input is reached is decided by the
 *     ProgramInput instance
 */
class Executor {
	#index: number;
	#cells: number[];
	#input: ProgramInput;
	#output: number[];

	constructor( input: ProgramInput ) {
		this.#index = 0;
		this.#cells = [ 0 ];
		this.#input = input;
		this.#output = [];
	}

	ensure_size() {
		if ( this.#cells.length <= this.#index ) {
			this.#cells.push(
				...( Array( this.#index - this.#cells.length + 1 ).fill( 0 ) )
			);
		}
	}

	execute_one( instruction: BfNode ) {
		if ( instruction instanceof SingleCommand ) {
			switch ( instruction.command ) {
				case Command.INCREMENT:
					this.ensure_size();
					if ( this.#cells[ this.#index ] === 255 ) {
						throw new Error( `Cannot increment cell #${this.#index} which is already 255` );
					}
					this.#cells[ this.#index ] += 1;
					return;
				case Command.DECREMENT:
					this.ensure_size();
					if ( this.#cells[ this.#index ] === 0 ) {
						throw new Error( `Cannot decrement cell #${this.#index} which is already 0` );
					}
					this.#cells[ this.#index ] -= 1;
					return;
				case Command.NEXT:
					this.#index += 1;
					return;
				case Command.PREVIOUS:
					if ( this.#index === 0 ) {
						throw new Error( "Cannot move to previous cell, alraedy at start" );
					}
					this.#index -= 1;
					return;
				case Command.OUTPUT:
					this.ensure_size();
					this.#output.push( this.#cells[ this.#index ] );
					return;
				case Command.INPUT:
					this.ensure_size();
					this.#cells[ this.#index ] = this.#input.next;
					return;
			}
			throw new Error( `Invalid instruction: ${instruction}` );
		}
		if ( instruction instanceof Loop ) {
			this.ensure_size();
			while ( this.#cells[ this.#index ] !== 0 ) {
				this.execute( instruction.commands );
				this.ensure_size();
			}
			return;
		}
		throw new Error( `Invalid instruction: ${instruction.toString()}` );
	}

	execute( instructions: BfNode[] ) {
		for ( const inst of instructions ) {
			this.execute_one( inst );
		}
	}

	get output () {
		return String.fromCharCode( ...this.#output );
	}
}

/**
 * Input to the Brainfuck program, based on a string - once exhausted, all
 * subsequent reads return 0
 */
class ProgramInput {
	#unread;
	constructor( input: string ) {
		this.#unread = input.split( '' );
	}
	get next (): number {
		if ( this.#unread.length === 0 ) {
			return 0;
		}
		const next = this.#unread.shift();
		if ( next === undefined ) {
			// Typescript was complaining
			return 0;
		}
		const asInt = next.codePointAt(0);
		if ( asInt === undefined || asInt > 255 ) {
			throw new Error( `${next} cannot be represented in range [0, 255]` );
		}
		return asInt;
	}
}

enum Command {
	INCREMENT,
	DECREMENT,
	NEXT,
	PREVIOUS,
	OUTPUT,
	INPUT,
}

abstract class BfNode {}
class SingleCommand extends BfNode {
	#command;
	constructor( command: Command ) {
		super();
		this.#command = command;
	}
	get command () {
		return this.#command;
	}
}
class Loop extends BfNode {
	#commands;
	constructor( commands: BfNode[] ) {
		super();
		this.#commands = commands;
	}
	get commands () {
		return this.#commands;
	}
}

const parse = ( tokens: Token[] ): BfNode[] => {
	const getSingleCommand = ( tok: Token ) => {
		switch ( tok ) {
			case Token.INCREMENT:
				return Command.INCREMENT;
			case Token.DECREMENT:
				return Command.DECREMENT;
			case Token.NEXT:
				return Command.NEXT;
			case Token.PREVIOUS:
				return Command.PREVIOUS;
			case Token.INPUT:
				return Command.INPUT;
			case Token.OUTPUT:
				return Command.OUTPUT;
		}
		return undefined;
	};
	const [nodes, loops, err] = tokens.reduce<[BfNode[], BfNode[][], string|false]>(
		([nodes, loops, err], currentToken) => {
			if ( err !== false ) {
				return [nodes, loops, err];
			}
			// Check for non-loop command
			const maybeSingle = getSingleCommand( currentToken );
			if (maybeSingle !== undefined) {
				// Add to last loop, or to main nodes if no current loops
				if ( loops.length ) {
					loops[ loops.length - 1 ].push( new SingleCommand( maybeSingle ) );
				} else {
					nodes.push( new SingleCommand( maybeSingle ) );
				}
				return [nodes, loops, err];
			}
			if ( currentToken === Token.START_JUMP ) {
				loops.push( [] );
				return [ nodes, loops, err ];
			}
			if ( currentToken === Token.END_JUMP ) {
				if ( loops.length ) {
					// Checked based on loops.length
					// @ts-ignore
					const endedLoop: BfNode[] = loops.pop();
					if ( loops.length ) {
						loops[ loops.length -1 ].push( new Loop( endedLoop ) );
					} else {
						nodes.push( new Loop( endedLoop ) );
					}
					return [ nodes, loops, err ];
				}
				// Nothing to end
				return [ nodes, loops, "No loop to close" ];
			}
			// Invalid token
			return [ nodes, loops, "Invalid token: " + String( currentToken ) ];
		},
		[ [], [], false ]
	);
	if ( err !== false ) {
		throw new Error( err );
	}
	if ( loops.length ) {
		throw new Error( "There were " + loops.length + " unterminated loops" );
	}
	return nodes;
}

enum Token {
	INCREMENT,
	DECREMENT,
	NEXT,
	PREVIOUS,
	OUTPUT,
	INPUT,
	START_JUMP,
	END_JUMP,
}
const tokenize = ( code: string ) => {
	const map: Record<string, Token> = {
		'+': Token.INCREMENT,
		'-': Token.DECREMENT,
		'>': Token.NEXT,
		'<': Token.PREVIOUS,
		'.': Token.OUTPUT,
		',': Token.INPUT,
		'[': Token.START_JUMP,
		']': Token.END_JUMP,
	};
	return code.split( '' )
		.filter( ( char ) => map[char] !== undefined )
		.map( ( char ) => map[char] );
}

export const runBrainfuck = ( code: string, input: string ): string => {
	const tokens = tokenize( code );
	const commands = parse( tokens );
	const programInput = new ProgramInput( input );
	const executor = new Executor( programInput );
	executor.execute( commands );
	return executor.output;
}
