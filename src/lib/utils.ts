
export function getChaosStyle() {
    const rotation = Math.random() * 6 - 3; 
    const translateX = Math.random() * 10 - 5;
    const translateY = Math.random() * 10 - 5;
    return {
        transform: `rotate(${rotation}deg) translate(${translateX}px, ${translateY}px)`,
    };
}

export function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
