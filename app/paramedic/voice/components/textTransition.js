import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TextTransition = ({ fontSize = 16, text }) => {
    const [animatedText, setAnimatedText] = useState([]);

    useEffect(() => {
        const changes = getDifferences(animatedText.map(t => t.char).join(''), text);
        setAnimatedText(changes);
    }, [text]);

    const getDifferences = (oldText, newText) => {
        const oldChars = oldText.split('');
        const newChars = newText.split('');
        return newChars.map((char, index) => ({
            char,
            shouldAnimate: oldChars[index] !== char,
            key: `${index}-${char}`, // 고유한 키 설정
        }));
    };

    const variants = {
        initial: (shouldAnimate) => ({
            opacity: shouldAnimate ? 0 : 1,
            x: shouldAnimate ? -20 : 0, // 왼쪽에서 시작
        }),
        animate: {
            opacity: 1,
            x: 0, // 제자리로 이동
            transition: {
                type: 'spring',
                stiffness: 500,
                damping: 30,
                mass: 1,
            },
        },
    };

    return (
        <div
            style={{
                display: 'inline-flex',
                flexWrap: 'wrap',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
            }}
        >
            {animatedText.map((item) => (
                <motion.span
                    key={item.key} // 안정적인 키 설정
                    custom={item.shouldAnimate}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    style={{
                        display: 'inline-block',
                        fontSize: `${fontSize}px`,
                    }}
                >
                    {item.char}
                </motion.span>
            ))}
        </div>
    );
};

export default TextTransition;
