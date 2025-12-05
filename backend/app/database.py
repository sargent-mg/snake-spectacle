from typing import Dict, List, Optional
from datetime import datetime, date
import uuid
from .models import User, LeaderboardEntry, ActivePlayer, GameMode, Position, Direction

class MockDatabase:
    def __init__(self):
        self.users: Dict[str, User] = {}  # email -> User
        self.passwords: Dict[str, str] = {}  # email -> password
        self.leaderboard: List[LeaderboardEntry] = []
        self.active_players: Dict[str, ActivePlayer] = {}
        
        # Initialize with some mock data
        self._init_mock_data()

    def _init_mock_data(self):
        # Mock Users
        users_data = [
            ("demo@snake.game", "DemoPlayer", "demo123"),
            ("viper@snake.game", "ViperStrike", "pass123"),
            ("python@snake.game", "Pythonista", "snake_case"),
            ("cobra@snake.game", "KingCobra", "hisshiss"),
            ("anaconda@snake.game", "BigSqueeze", "constrict"),
            ("mamba@snake.game", "BlackMamba", "fastbite")
        ]
        
        for email, username, password in users_data:
            self.create_user(email, username, password)
        
        # Mock Leaderboard
        leaderboard_data = [
            ("NeonMaster", 1100, GameMode.walls, "2024-01-15"),
            ("PixelKing", 1050, GameMode.passthrough, "2024-01-14"),
            ("ArcadeQueen", 1070, GameMode.walls, "2024-01-13"),
            ("RetroGamer", 920, GameMode.passthrough, "2024-01-12"),
            ("SnakeCharmer", 930, GameMode.walls, "2024-01-11"),
            ("BitRunner", 850, GameMode.passthrough, "2024-01-10"),
            ("VectorViper", 400, GameMode.walls, "2024-01-09"),
            ("GlitchGuru", 300, GameMode.passthrough, "2024-01-08"),
            ("CyberSnake", 100, GameMode.walls, "2024-01-07"),
            ("NeonByte", 200, GameMode.passthrough, "2024-01-06"),
            ("ViperStrike", 550, GameMode.walls, "2024-01-16"),
            ("Pythonista", 600, GameMode.passthrough, "2024-01-16"),
            ("KingCobra", 720, GameMode.walls, "2024-01-15"),
            ("BigSqueeze", 680, GameMode.passthrough, "2024-01-15"),
            ("BlackMamba", 920, GameMode.walls, "2024-01-14"),
            ("DemoPlayer", 160, GameMode.passthrough, "2024-01-14"),
            ("ViperStrike", 180, GameMode.passthrough, "2024-01-13"),
            ("Pythonista", 320, GameMode.walls, "2024-01-13"),
            ("KingCobra", 460, GameMode.passthrough, "2024-01-12"),
            ("BigSqueeze", 320, GameMode.walls, "2024-01-12")
        ]

        for i, (username, score, mode, date_str) in enumerate(leaderboard_data):
            self.leaderboard.append(LeaderboardEntry(
                id=str(i + 1),
                username=username,
                score=score,
                mode=mode,
                date=date.fromisoformat(date_str)
            ))

    def create_user(self, email: str, username: str, password: str) -> Optional[User]:
        if email in self.users:
            return None
        
        # Check username uniqueness
        for user in self.users.values():
            if user.username.lower() == username.lower():
                return None

        user_id = str(uuid.uuid4())
        new_user = User(
            id=user_id,
            username=username,
            email=email,
            createdAt=datetime.now()
        )
        
        self.users[email] = new_user
        self.passwords[email] = password
        return new_user

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.users.get(email)

    def verify_password(self, email: str, password: str) -> bool:
        return self.passwords.get(email) == password

    def get_leaderboard(self, mode: Optional[GameMode] = None) -> List[LeaderboardEntry]:
        entries = self.leaderboard
        if mode:
            entries = [e for e in entries if e.mode == mode]
        return sorted(entries, key=lambda x: x.score, reverse=True)[:10]

    def add_score(self, username: str, score: int, mode: GameMode) -> LeaderboardEntry:
        entry = LeaderboardEntry(
            id=str(uuid.uuid4()),
            username=username,
            score=score,
            mode=mode,
            date=date.today()
        )
        self.leaderboard.append(entry)
        return entry

    def get_active_players(self) -> List[ActivePlayer]:
        # Generate some mock active players if empty
        if not self.active_players:
            self._generate_mock_active_players()
        return list(self.active_players.values())

    def get_player(self, player_id: str) -> Optional[ActivePlayer]:
        return self.active_players.get(player_id)

    def _generate_mock_active_players(self):
        # Similar to frontend mock generation
        players_data = [
            {
                "id": "active-1",
                "username": "LivePlayer1",
                "score": 150,
                "mode": GameMode.walls,
                "snake": [Position(x=10, y=10), Position(x=9, y=10)],
                "food": Position(x=15, y=12),
                "direction": Direction.RIGHT,
                "startedAt": datetime.now()
            },
            {
                "id": "active-2",
                "username": "ProGamer99",
                "score": 320,
                "mode": GameMode.passthrough,
                "snake": [Position(x=5, y=5), Position(x=5, y=6), Position(x=5, y=7)],
                "food": Position(x=8, y=8),
                "direction": Direction.UP,
                "startedAt": datetime.now()
            },
            {
                "id": "active-3",
                "username": "SnakeMaster",
                "score": 80,
                "mode": GameMode.walls,
                "snake": [Position(x=15, y=15), Position(x=16, y=15)],
                "food": Position(x=12, y=12),
                "direction": Direction.LEFT,
                "startedAt": datetime.now()
            }
        ]
        
        for p_data in players_data:
            player = ActivePlayer(**p_data)
            self.active_players[player.id] = player

# Global instance
db = MockDatabase()
