
function importSequence()
{
    'use strict';
    const SEQUENCE_INF = 1 << 30;
    const SEQUENCE_INF_MASK = ~0 >>> 2;

    function Sequence(acessor, length = SEQUENCE_INF) { return {at: acessor, length}; }

    function isSequence(seq)     { return (typeof seq === 'object' && 'at' in seq && 'length' in seq);}
    function isSequenceInf(seq)  { return (seq.length & SEQUENCE_INF) > 0; }
    function isSequenceFin(seq)  { return (seq.length & SEQUENCE_INF) == 0; }
    function sequenceLength(seq) { return seq.length & SEQUENCE_INF_MASK; }

    function identitySequence() { return Sequence(i => i, array.length); }
    function arraySequence(array) { return Sequence(i => array[i], array.length); }
    function constSequence(val, length = SEQUENCE_INF) { return Sequence(_ => val, length); }
    function generatorSequence(acessor, length = SEQUENCE_INF) 
    { 
        const seq = {length, counter: 0};
        seq.at = () => acessor(seq.counter++);
        return seq;
    }
    function counterSequence(length = SEQUENCE_INF) { return generatorSequence(i => i, length); }
    function ascendingSequence(from, length = SEQUENCE_INF) { return Sequence(i => from + i, length); }
    function descendingSequence(from, length = SEQUENCE_INF) { return Sequence(i => from - i, length); }
    
    function mapSequence(seq, mapper) { return Sequence(i => mapper(seq.at(i)), seq.length); }
    function foreach(seq, finite, infinite, breakAt = false) 
    {
        const len = sequenceLength(seq);
        for(let i = 0; i < len; i++)
            if(finite(seq.at(i), i, seq) === breakAt)
                break;
        
        if(isSequenceFin(seq))
            infinite(seq.at(len), len, seq);
    }

    function toArray(seq, maxLength = Infinity)
    {
        const len = Math.min(sequenceLength(seq), maxLength);
        const out = new Array(len);
        for(let i = 0; i < len; i++)
            out[i] = seq.at(i);
        
        return out;
    }

    const Generator = generatorSequence;
    const Counter = counterSequence;
    const Iota = ascendingSequence;

    return {
        SEQUENCE_INF,
        SEQUENCE_INF_MASK,

        Sequence,
        Generator,
        Counter,
        Iota,
        isSequence,
        isSequenceInf,
        isSequenceFin,
        sequenceLength,
        identitySequence,
        arraySequence,
        constSequence,
        generatorSequence,
        counterSequence,
        ascendingSequence,
        descendingSequence,
        mapSequence,

        '%private': {
            toArray,
            foreach,
            map: mapSequence,
            identity: identitySequence,
            array: arraySequence,
            const: constSequence,
            counter: counterSequence,
            ascending: ascendingSequence,
            descending: descendingSequence,
        }
    };
}
