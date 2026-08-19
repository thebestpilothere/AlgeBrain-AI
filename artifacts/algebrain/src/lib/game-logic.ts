import { Difficulty, Question, Topic } from './types';

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const formatSign = (n: number) => (n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`);

export function createRandomQuestion(difficulty: Difficulty): Question {
  let text = '';
  let answer = 0;
  let topic: Topic = 'one-step';

  if (difficulty === 'easy') {
    topic = 'one-step';
    answer = rnd(1, 20);
    const a = rnd(1, 20);
    const type = rnd(1, 3);
    
    if (type === 1) {
      // x + a = b
      const b = answer + a;
      text = `x + ${a} = ${b}`;
    } else if (type === 2) {
      // x - a = b
      const b = answer - a;
      text = `x - ${a} = ${b}`;
    } else {
      // a + x = b
      const b = a + answer;
      text = `${a} + x = ${b}`;
    }
  } else if (difficulty === 'medium') {
    topic = 'two-step';
    answer = rnd(1, 12);
    const a = rnd(2, 9);
    const type = rnd(1, 3);
    
    if (type === 1) {
      // ax + b = c
      const b = rnd(1, 20);
      const c = a * answer + b;
      text = `${a}x + ${b} = ${c}`;
    } else if (type === 2) {
      // ax - b = c
      const b = rnd(1, 20);
      const c = a * answer - b;
      text = `${a}x - ${b} = ${c}`;
    } else {
      // b + ax = c
      const b = rnd(1, 20);
      const c = b + a * answer;
      text = `${b} + ${a}x = ${c}`;
    }
  } else if (difficulty === 'hard') {
    topic = 'distributive';
    answer = rnd(1, 15);
    const type = rnd(1, 2);
    
    if (type === 1) {
      // a(bx + c) = d
      const a = rnd(2, 5);
      const b = rnd(1, 3);
      const c = rnd(1, 10);
      const d = a * (b * answer + c);
      const bxStr = b === 1 ? 'x' : `${b}x`;
      text = `${a}(${bxStr} + ${c}) = ${d}`;
    } else {
      // a(x - b) = c
      const a = rnd(2, 7);
      const b = rnd(1, 10);
      const c = a * (answer - b);
      text = `${a}(x - ${b}) = ${c}`;
    }
  } else {
    topic = 'variables-both-sides';
    answer = rnd(1, 20);
    const type = rnd(1, 2);
    
    if (type === 1) {
      // ax - b = cx + d
      let a = rnd(2, 9);
      let c = rnd(1, 8);
      while (a === c) { c = rnd(1, 8); }
      const b = rnd(1, 20);
      let d = a * answer - b - c * answer;
      text = `${a}x - ${b} = ${c}x ${formatSign(d)}`;
    } else {
      // a(x + b) = cx + d
      const a = rnd(2, 5);
      const b = rnd(1, 10);
      let c = rnd(1, 8);
      while (a === c) { c = rnd(1, 8); }
      const d = a * (answer + b) - c * answer;
      text = `${a}(x + ${b}) = ${c}x ${formatSign(d)}`;
    }
  }

  // Hash ID
  const id = btoa(text);

  return { id, text, answer, topic, difficulty };
}

export function generateQuestion(difficulty: Difficulty, usedIds: Set<string>): Question {
  while (true) {
    const q = createRandomQuestion(difficulty);
    if (!usedIds.has(q.id)) {
      return q;
    }
  }
}

export function getAIHint(topic: Topic, userAnswer: number, correctAnswer: number): string {
  if (Math.abs(userAnswer - correctAnswer) <= 1) {
    return "You're very close! Check your arithmetic — did you add/subtract correctly?";
  }
  if (userAnswer === -correctAnswer && correctAnswer !== 0) {
    return "Check your signs — it looks like a negative/positive confusion.";
  }

  switch (topic) {
    case 'one-step':
      return "Try isolating x. Move the constant to the other side first.";
    case 'two-step':
      return "Subtract or add the constant to both sides first, then divide by the coefficient next to x.";
    case 'distributive':
      return "Expand the brackets first: multiply each term inside by the factor outside.";
    case 'variables-both-sides':
      return "Gather all x terms on one side and constants on the other.";
  }
}
