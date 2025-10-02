# backend/humanizer.py
import random
import re
from typing import List, Tuple
import json

class NaturalHumanizer:
    """
    Advanced humanizer that mimics genuine human writing patterns
    rather than adding artificial markers.
    """
    
    def __init__(self):
        # Natural conversation starters that feel genuine
        self.natural_openers = [
            "So here's the thing about",
            "Let me break down",
            "Honestly, when it comes to",
            "The way I understand",
            "From what I've seen,",
            "In my experience with",
            "Here's what I know about"
        ]
        
        # Subtle transitions that humans actually use
        self.transitions = {
            'addition': ['Plus,', 'Also worth noting:', 'Another thing is', 'Oh and', 'Not to mention'],
            'contrast': ['That said,', 'On the flip side,', 'Although', 'Then again,'],
            'explanation': ['Basically,', 'The thing is,', 'What happens is', 'See,'],
            'emphasis': ['Actually,', 'The real key is', 'What really matters is', 'The cool part is']
        }
        
        # Real conversational patterns people use
        self.thinking_phrases = [
            "if that makes sense",
            "you know what I mean",
            "hard to explain but",
            "put it this way",
            "think of it like",
            "the way I see it"
        ]
        
        # Natural opinion injections
        self.opinion_markers = [
            "I find that",
            "In my view",
            "What I've noticed is",
            "From my perspective",
            "I tend to think"
        ]
        
        # Genuine uncertainty expressions
        self.uncertainty = [
            "I believe",
            "probably",
            "seems like",
            "I'd say",
            "might be",
            "could be that",
            "as far as I know"
        ]

    def vary_sentence_structure(self, text: str) -> str:
        """
        Create natural sentence variety like humans do.
        """
        sentences = re.split(r'(?<=[.!?])\s+', text)
        result = []
        
        for i, sent in enumerate(sentences):
            if not sent.strip():
                continue
                
            # Occasionally start with conjunctions (humans do this)
            if i > 0 and random.random() < 0.15:
                starters = ['And', 'But', 'So', 'Now,', 'Plus']
                sent = random.choice(starters) + ' ' + sent[0].lower() + sent[1:]
            
            # Sometimes break long sentences into fragments
            words = sent.split()
            if len(words) > 15 and random.random() < 0.2:
                mid = len(words) // 2
                # Find a good breaking point
                for j in range(mid-3, mid+3):
                    if j < len(words) and words[j] in ['and', 'but', 'which', 'that', 'so']:
                        part1 = ' '.join(words[:j])
                        part2 = ' '.join(words[j:])
                        sent = part1 + '. ' + part2.capitalize()
                        break
            
            result.append(sent)
        
        return ' '.join(result)

    def add_personal_touch(self, text: str, topic: str = None) -> str:
        """
        Add genuine personal observations without being formulaic.
        """
        if random.random() < 0.25:
            personal_touches = [
                f"I've worked with this quite a bit",
                f"This is something I've seen come up a lot",
                f"I remember when I first encountered this",
                f"This actually surprised me when I learned it",
                f"I used to think differently about this"
            ]
            
            # Insert naturally in the middle rather than always at the end
            sentences = text.split('. ')
            if len(sentences) > 2:
                insert_pos = random.randint(1, len(sentences)-1)
                touch = random.choice(personal_touches)
                sentences.insert(insert_pos, touch)
                text = '. '.join(sentences)
        
        return text

    def natural_word_choice(self, text: str) -> str:
        """
        Replace some formal words with conversational equivalents.
        """
        replacements = {
            r'\butilize\b': 'use',
            r'\bfacilitate\b': 'help with',
            r'\bdemonstrate\b': 'show',
            r'\bimplement\b': 'set up',
            r'\boptimal\b': 'best',
            r'\bnumerous\b': 'many',
            r'\bprimarily\b': 'mainly',
            r'\bsubsequently\b': 'then',
            r'\badditionally\b': 'also',
            r'\bfurthermore\b': 'plus',
            r'\bconsequently\b': 'so',
            r'\bapproximately\b': 'about',
            r'\bsubstantial\b': 'big',
            r'\bsignificant\b': 'important',
            r'\benable\b': 'let',
            r'\bensure\b': 'make sure',
            r'\brequire\b': 'need'
        }
        
        for formal, casual in replacements.items():
            if random.random() < 0.7:  # Don't replace everything
                text = re.sub(formal, casual, text, flags=re.IGNORECASE)
        
        return text

    def add_natural_flow(self, text: str) -> str:
        """
        Add natural conversational flow without obvious fillers.
        """
        sentences = re.split(r'(?<=[.!?])\s+', text)
        result = []
        
        for i, sent in enumerate(sentences):
            if not sent.strip():
                continue
            
            # Occasionally add thinking phrases mid-sentence
            if random.random() < 0.1 and ',' in sent:
                parts = sent.split(',', 1)
                if len(parts) == 2:
                    phrase = random.choice(self.thinking_phrases)
                    sent = parts[0] + f', {phrase}, ' + parts[1].strip()
            
            # Natural transitions between sentences
            if i > 0 and random.random() < 0.2:
                transition_type = random.choice(list(self.transitions.keys()))
                transition = random.choice(self.transitions[transition_type])
                sent = transition + ' ' + sent[0].lower() + sent[1:]
            
            result.append(sent)
        
        return ' '.join(result)

    def create_natural_rhythm(self, text: str) -> str:
        """
        Vary sentence lengths for natural rhythm.
        """
        sentences = re.split(r'(?<=[.!?])\s+', text)
        result = []
        last_was_long = False
        
        for sent in sentences:
            words = sent.split()
            word_count = len(words)
            
            # After a long sentence, maybe add a short punchy one
            if last_was_long and random.random() < 0.3:
                short_additions = [
                    "That's the gist.",
                    "Pretty straightforward.",
                    "Makes sense?",
                    "That's basically it.",
                    "Simple as that."
                ]
                result.append(sent)
                result.append(random.choice(short_additions))
                last_was_long = False
            else:
                result.append(sent)
                last_was_long = word_count > 15
        
        return ' '.join(result)

    def add_subtle_imperfections(self, text: str) -> str:
        """
        Add subtle human imperfections without being obvious.
        """
        # Occasionally use contractions inconsistently (humans do this)
        if random.random() < 0.3:
            contractions = [
                (r'\bit is\b', "it's"),
                (r'\bdo not\b', "don't"),
                (r'\bcannot\b', "can't"),
                (r'\bwill not\b', "won't"),
                (r'\bthat is\b', "that's"),
                (r'\byou are\b', "you're"),
                (r'\bthey are\b', "they're")
            ]
            
            # Only contract some, not all (inconsistency is human)
            for full, short in contractions:
                if random.random() < 0.6:
                    # Replace only first occurrence to maintain inconsistency
                    text = re.sub(full, short, text, count=1, flags=re.IGNORECASE)
        
        # Occasionally use informal punctuation
        if random.random() < 0.15:
            text = re.sub(r'\.(\s+[A-Z])', r'...\1', text, count=1)
        
        # Sometimes use dashes for emphasis
        if random.random() < 0.2:
            sentences = text.split('. ')
            if len(sentences) > 1:
                idx = random.randint(0, len(sentences)-1)
                if ',' in sentences[idx]:
                    sentences[idx] = sentences[idx].replace(',', ' -', 1)
            text = '. '.join(sentences)
        
        return text

    def humanize(self, text: str, context: str = None) -> str:
        """
        Main humanization function that applies natural transformations.
        """
        # Clean up the input
        text = text.strip()
        
        # Skip if too short
        if len(text.split()) < 10:
            return text
        
        # Apply transformations in a specific order for best results
        
        # 1. Natural word choice first
        text = self.natural_word_choice(text)
        
        # 2. Vary sentence structure
        text = self.vary_sentence_structure(text)
        
        # 3. Add natural conversational flow
        text = self.add_natural_flow(text)
        
        # 4. Create rhythm
        text = self.create_natural_rhythm(text)
        
        # 5. Add personal touch if appropriate
        if random.random() < 0.4:
            text = self.add_personal_touch(text, context)
        
        # 6. Add subtle imperfections
        text = self.add_subtle_imperfections(text)
        
        # 7. Occasionally add a natural opener
        if random.random() < 0.3:
            opener = random.choice(self.natural_openers)
            # Extract the topic from the first sentence if possible
            first_sentence = text.split('.')[0]
            if 'is' in first_sentence:
                topic = first_sentence.split('is')[0].strip()
                text = f"{opener} {topic.lower()}: {text[0].lower()}{text[1:]}"
            else:
                text = f"{opener} this: {text[0].lower()}{text[1:]}"
        
        # 8. Clean up any double spaces or punctuation issues
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\s+([,.!?])', r'\1', text)
        
        return text.strip()


# Advanced humanizer instance
advanced_humanizer = NaturalHumanizer()

def humanize_text(text: str, style: str = "conversational") -> str:
    """
    Main function to humanize text with different style options.
    
    Args:
        text: The text to humanize
        style: The style of humanization ("conversational", "professional", "casual")
    """
    if style == "professional":
        # Less aggressive humanization for professional contexts
        humanizer = NaturalHumanizer()
        # Reduce probability of casual elements
        text = humanizer.natural_word_choice(text)
        text = humanizer.vary_sentence_structure(text)
        return text
    
    elif style == "casual":
        # More aggressive humanization for casual contexts
        humanizer = NaturalHumanizer()
        text = humanizer.humanize(text)
        # Add extra casual elements
        text = humanizer.add_subtle_imperfections(text)
        return text
    
    else:  # conversational (default)
        return advanced_humanizer.humanize(text)


def batch_humanize(texts: List[str]) -> List[str]:
    """
    Humanize multiple texts with variety between them.
    """
    results = []
    for text in texts:
        # Vary the style slightly for each text
        style = random.choice(["conversational", "conversational", "casual"])
        results.append(humanize_text(text, style))
    return results


if __name__ == "__main__":
    # Test with your React example
    sample_text = """React is a popular JavaScript library for building user interfaces.
It allows developers to create reusable UI components.
React uses a virtual DOM to efficiently update and render UI components when data changes."""
    
    print("Original:")
    print(sample_text)
    print("\n" + "="*50 + "\n")
    
    for i in range(3):
        print(f"Humanized Version {i+1}:")
        print(humanize_text(sample_text))
        print("\n" + "-"*50 + "\n")