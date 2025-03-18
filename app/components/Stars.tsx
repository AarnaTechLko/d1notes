interface StarProps {
    filled: number
}

const Star: React.FC<StarProps> = ({ filled }) => (
    <span
        className="relative inline-block text-gray-300"
        style={{
            background: `linear-gradient(90deg, #facc15 ${filled}%, #d1d5db ${filled}%)`,
            WebkitBackgroundClip: 'text',
            color: 'transparent'
        }}
    >
        ★
    </span>
);

export default Star;
