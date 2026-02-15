"use client";

import { useState, useEffect } from "react";
import { runBrainfuck } from '@/lib/brainfuck';

/**
 * Return the current UTC time as HHMMSSsss
 */
function getNowUTC(): string {
  const now = new Date();
  const hours = pad(now.getUTCHours());
  const minutes = pad(now.getUTCMinutes());
  const seconds = pad(now.getUTCSeconds());
  const milliseconds = pad(now.getUTCMilliseconds(), 3);
  return hours + minutes + seconds + milliseconds;
}

const brainFuckCode = `
[
	Given a time HHMMSSsss in UTC, find how long until the next merge
	Merges happen at 190000.000 UTC
	* Times <  190000.000: difference between current time and 190000.000 UTC
	* Times >= 190000.000: 24 hours minus difference between 190000.000 and current time
]
{Read in two decimal digits for the current hour HH}
,> ,>
{ Data: {H H @0 } }

{And now for the current minute}
,> ,>
{ Data: { H H M M @0 } }

{And now for the current second}
,> ,>
{ Data: { H H M M S S @0 } }

{And now for the current millisecond}
,> ,> ,>

{Subtract 48 from each of the hour so that we have integers rather than ASCII}
{ 48 = 6 * 8 }

++++ ++

{ Data: { H H M M S S s s s @8 0 } }
{ i = 8 and goes to 0 }
{ each time j after it goes from 6 to 0 }

[
	-
	{Set j to 8}
	> ++++ ++++
	{ Data: { H' H' M' M' S' S' i @8 } }

	{While j}
	[
		{Decrement j}
		-
		{Skip i}
		<
		<- <- <- <- <- <- <- <- <-
		{Go back to j}
		>>>> >>>> > >
	]
	{Go back to i}
	<
]

{ Data: { H' H' M' M' S' S' s' s' s' @0 0 } }
	Where ' means cell holds hundreds or tens or ones digit as a number

{Skipping milliseconds for now}
<<<

{Convert to real numbers }
{Seconds}
<<
[ - > ++++ ++++ ++ < ]

{ Data: { H' H' M' M' @0 ss } }

{Minutes}
<<
[ - > ++++ ++++ ++ < ]

{ Data: { H' H' @0 mm 0 ss } }

{Hours}
<<
[ - > ++++ ++++ ++ < ]

{ Data: { @0 hh 0 mm 0 ss s' s' s' } }

"EXTRA SECOND ADDITION" for milliseconds simplification; see further details
below

>>>>> +
{ Data: { 0 hh 0 mm 0 @(ss plus 1) s' s' s' } }

{ Hereafter we don't note each time that an extra second was added }

{Conditions are complicated; delay until the end the decision about if the
next merge is today or tomorrow; assume tomorrow and then maybe remove another
24 hours}

{next merge will take place effectively at 19{plus}24; subtract current
time from then; ie from 430000}

>>> >>>

{Store new time}
++++ ++++ ++++ ++++ ++++ ++++ ++++ ++++ ++++ ++++ +++

{Subtract hours}
<<<<<<< <<<
[
-
>>>>>>> >>>
-
<<<<<<< <<<
]

{Add indicator at index 1 for use later}
+

{010m0s s' s' s' 00H}
  ^

{Subtract minutes}
>>
[
    {Has minutes; decrement hour and add 60 minutes}
    >>>> >>>>
    -
    >
    ++++ ++++ ++++ ++++ ++++
    ++++ ++++ ++++ ++++ ++++
    ++++ ++++ ++++ ++++ ++++
    <<<< <<<<<
    [
        -
        >>>> >>>>>
        -
        <<<< <<<<<
    ]
]


{Subtract seconds}
>>
[
    {Has seconds; check if we can subtract minute or if need hour}
    >>>>>>>
    [
        {Have hour to subtract from}
        -
        >
        ++++ ++++ ++++ ++++ ++++
        ++++ ++++ ++++ ++++ ++++
        ++++ ++++ ++++ ++++ ++++
        <<<< <<<<
        [
            -
            >>>> >>>>
            -
            <<<< <<<<
        ]
    ]
]

{
EITHER:
{0100 00s' s' s' 000 HMS}
       ^
       If we had both minutes and seconds (or just minutes)


{0100 0ss' s' s' 000H 00}
                      ^
             If we had just seconds

Go left: if zero then first case and otherwise second case
}
<
[
    {Else block: need to subtract seconds from hours}
    -
    >    
    ++++ ++++ ++++ ++++ ++++
    ++++ ++++ ++++ ++++ ++++
    ++++ ++++ ++++ ++++ +++
    >    
    ++++ ++++ ++++ ++++ ++++
    ++++ ++++ ++++ ++++ ++++
    ++++ ++++ ++++ ++++ ++++

    <<<< <<<<
    [
        -
        >>>> >>>>
        -
        <<<< <<<<
    ]
]

EITHER:
{0100 00 s' s' s' 00 HMS}
      ^
      If we had minutes and seconds
      If we had just minutes
      If we had neither

{0100 00 s' s' s' 00 HMS}
       ^
       If we had just seconds

Go left 3 and then go left while positive
In the first case: go to index 0 and stay
In the second case: go to index 1 and then go to 0
<<<<
[<]

{0100 00 s' s' s' 00 HMS}
 ^

{Check if H is 24 or more and subtract if so}

>>>> >>>>>>>
{0100 00 s' s' s' 00 HMS}
                     ^

{Make 2 copies of H since copying is destructive}
[
-
>>> + > +
<<<<
]
{0100 0000 0MSH H}
           ^

{Conditions are complicated so we can just avoid using one;
decrement H (second copy) until we reach the end and build up a list of 1s
after a 0 giving something like
{0100 0000 0MSH 0011 1111 1111 1111 1111 1111 1000} if H was 25}

>>>>
[
-
>>
[>]
+
[<]
<
]

{If the indicator for 24 is set subtract 24 from H}
>>>> >>>> >>>> >>>> >>>> >>>> >
[
    {Zero the indicator}
    -
    {Reduce H}
    <<<< <<<< <<<< <<<< <<<< <<<< <<
    ---- ---- ---- ---- ---- ----
    >>>> >>>> >>>> >>>> >>>> >>>> >>
]

Clean up: up to 18 additional indicators to the right of here that we want to
zero and then some number of previous indicators; instead of complicated logic
to figure out how many to zero just hardcode zeroing all of them

>>>> >>>> >>>> >>>> >>

[-]< [-]< [-]< [-]< [-]< [-]< [-]< [-]<
[-]< [-]< [-]< [-]< [-]< [-]< [-]< [-]<
[-]< [-]< [-]< [-]< [-]< [-]< [-]< [-]<
[-]< [-]< [-]< [-]< [-]< [-]< [-]< [-]<
[-]< [-]< [-]< [-]< [-]< [-]< [-]< [-]<
[-]< [-]<
<<

{0100 00s' s' s' 00 0MSH 0000}
                       ^

{
Approach for milliseconds given that we cannot put the entire value of 1000
into a single cell:

assume the number of milliseconds is NOT going to be 0 and thus there will always
be a part of a second to subtract; if this is wrong then the display will be a
bit off but lets consider that a feature rather than a bug
    that part is implemented with the "EXTRA SECOND ADDITION" noted above
    we add the second to the original time before doing the comparison with 190000
    rather than subtracting it later and risking needing to underflow

similarly we pretend that there are only 999 milliseconds in a second and so
don't need to worry about carrying

Given that the logic implemented in Brainfuck is not going to be as fast as doing the
math in JavaScript this is actually a FEATURE rather than a bug; it actually turns
out that the combination of these two decisions results in supporting
000 milliseconds properly and we always just treat the calculation as taking 1 ms:
    1 second (minus) current ms (minus) 1 ms for processing
    = 1000 ms (minus) current ms (minus) 1 ms
    = 1000 ms (minus) 1 ms (minus) current ms
    = 999 ms (minus) current ms

We need 999 (minus) current milliseconds: subtract each piece
}

<<
< ++++ ++++ +
< ++++ ++++ +
< ++++ ++++ +


{0100 00s' s' s' 999MSH 00}
                 ^

<<< [- >>> - <<<]
{0100 000 s' s' {a} 99MSH 00} where {a} is the hundreds place of the milliseconds
        ^

> [- >>> - <<<]
{0100 000 0 s' {a} {b} 9MSH 00} and {b} is the tens place
          ^

> [- >>> - <<<]
{0100 000 0 0 {a} {b} {c} MSH 00} and {c} is the ones place
            ^

{Now that we know what {a} {b} and {c} are the {} will be omitted and written
as ABC to be easier to spot among the 0s}

{
We now have the hours/minutes/seconds/milliseconds LEFT until the merge; output them
but format as ASCII; for hours/minutes/seconds these are integer fields and need
to be split into the tens and ones components
}

>>>>>>
{Run divmod on H and 10}

{Set the 10}
>> ++++ ++++ ++ <<

{
    DIVMOD explained
    We loop until the input (here H) is all processed
    In a loop:
    * Subtract 1 from input
    * Add 1 to cell #2 that will be a copy of the input at the end
    * Subtract one from the requested denominator
    * If the requested denominator has NOT become zero:
        * go right and add 1 to the copy of our denominator so that the data
            is not lost
        * go right a bit more to get out of the way
    * Otherwise:
        * go right to the copy of the denominator
        * add 1 for the 1 we just subtracted
        * move the denominator back to the original cell it was in
        * go to the cell holding our division result and add 1
    At the end:
    * input numerator is empty (0)
    * next cell has a copy of the numerator
    * cell after has the in-progress denominator subtraction and will be ignored
    * cell after that has in-progress denominator addition and represents the
        modulus result
    * last cell has the division result
}
[->+>-[>+>>]>[+[-<+>]>+>>]<<<<<<]

{0100 0000 0ABC MS0H DXY0 0000}
                  ^
Here D = 10 {minus} {H mod 10}
     X = H mod 10
     Y = H div 10
>[-]>[-]
>>
{0100 0000 0ABC MS0H DXY0 0000}
                       ^

{Copy over tens digit}
[
    -
    <<<< <<<< <<<< <<<<
    +
    >>>> >>>> >>>> >>>>
]
{Copy over ones digit}
<
[
    -
    <<<< <<<< <<<< <<
    +
    >>>> >>>> >>>> >>
]

{01HH 0000 0ABC MS00 0000}
                     ^
{Another divmod for seconds}
<< ++++ ++++ ++
<<

[->+>-[>+>>]>[+[-<+>]>+>>]<<<<<<]

{01HH 0000 0ABC M0SD XY00}
                 ^
Here D = 10 {minus} {S mod 10}
     X = S mod 10
     Y = S div 10
>[-]>[-]
>>
{01HH 0000 0ABC M000 XY00}
                      ^
{Copy over tens digit for seconds}
[
    -
    <<<< <<<< <<<
    +
    >>>> >>>> >>>
]
{Copy over ones digit for seconds}
<
[
    -
    <<<< << <<<
    +
    >>>> >> >>>
]

{Set up divmod for minutes}
<< ++++ ++++ ++
<<

[->+>-[>+>>]>[+[-<+>]>+>>]<<<<<<]

{01HH 00SS 0ABC 0MDX Y000}
                ^
Here D = 10 {minus} {M mod 10}
     X = M mod 10
     Y = M div 10
>[-]>[-]
>>

{Copy over tens digit for minutes}
[
    -
    <<<< <<<< <<<<
    +
    >>>> >>>> >>>>
]
{Copy over ones digit for minutes}
<
[
    -
    <<<< <<<< <<
    +
    >>>> >>>> >>
]

<<

{01hh mmss 0ABC 0000}
                 ^

We want to print Hours:Minutes:Seconds(dot)milliseconds
with ASCII; use a loop at add 48 to cells 2 through 12

++++ ++++
[
    -
    <
    ++++ ++
    [
        -
        <+ <+ <+ <+
        <+ <+ <+ <+
        <+ <+ <+
        >>>> >>>> >>>
    ]
    >
]

Cells are:
0 49 H H M M S S 48 {A} {B} {C} 0 0
                                 ^
where H/M/S are ASCII codes for those digits and same with {A}{B}{C}
Update 48 to be 46 which is ASCII for a period
<<<< <
--


Cells are:
0 49 H H M M S S 46 {A} {B} {C} 0 0
                 ^

Update 49 to be 58 for a colon
<<<< <<<
++++ ++++ +

Cells: 58 H H M M S S 46 {A} {B} {C}
       ^
Ready to print

Hours = ??
> . > .
Separator :
<< .
Minutes = ??
>> > . > .
Separator :
<<<< .
Seconds = ??
>>>> >. >.
Separator period
>.
Milliseconds = ???
>. >. >.`;

function getTimeRemaining(): {
  hours: string;
  minutes: string;
  seconds: string;
  milliseconds: string;
} {
  const nowString = getNowUTC();
  const remaining = runBrainfuck( brainFuckCode, nowString );

  const hours = remaining.substring( 0, 2 );
  const minutes = remaining.substring( 2, 4 );
  const seconds = remaining.substring( 4, 6 );
  const milliseconds = remaining.substring( 6 );

  return { hours, minutes, seconds, milliseconds };
}

function pad(n: number, count: number = 2): string {
  return n.toString().padStart(count, "0");
}

export function Countdown() {
  const [time, setTime] = useState(() => getTimeRemaining());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(getTimeRemaining());
    }, 53); // just a prime number

    return () => clearInterval(interval);
  }, [time]);

  if (!mounted) {
    return (
      <div>
        <div>NEXT MERGE COUNTDOWN</div>
        <div>
          -- DAYS : -- HOURS : -- MINS : -- SECS
        </div>
        <div>&nbsp;</div>
      </div>
    );
  }

  return (
    <div>
      <div>NEXT MERGE COUNTDOWN</div>
      <div>
        {time.hours} HOURS : {time.minutes} MINS : {time.seconds} SECS : {time.milliseconds} MS
      </div>
      <div>&nbsp;</div>
    </div>
  );
}
