import ctypes
import math
import os
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"
import time
import easygui
import pygame
import sys
from game import Game
import argparse

if os.name == "nt":
    ctypes.windll.kernel32.SetConsoleTitleW("QWARKS")

if getattr(sys, 'frozen', False):  # Check if running as a PyInstaller bundle
    os.chdir(os.path.dirname(sys.executable))
else:
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

parser = argparse.ArgumentParser(add_help=False)
parser.add_argument(
    "players",
    metavar="P",
    type=str,
    nargs="*",
    help="the players to run with instead of prompting",
)
parser.add_argument(
    "-h",
    "--headless",
    action="store_true",
    default=False,
    help="run in headless mode (without the visualizer)",
)
parser.add_argument(
    "-s",
    "--speed",
    action="store_true",
    default=False,
    help="run in speed mode (doesn't enforce some restrictions for the sake of speed)",
)
parser.add_argument(
    "-r",
    "--read",
    action="store",
    default="",
    type=str,
    help="load from a replay file",
)
parser.add_argument(
    "-a",
    "--autorun",
    action="store_true",
    default=False,
    help="autorun the game in the visualizer",
)
parser.add_argument(
    "-o",
    "--nooverlay",
    action="store_true",
    default=False,
    help="hide the overlay (energy and action lines)",
)
parser.add_argument(
    "-t",
    "--nostats",
    action="store_true",
    default=False,
    help="hides stats for each team",
)
parser.add_argument(
    "-k",
    "--skip",
    action="store_true",
    default=False,
    help="enables round skipping (only updates the screen every 5 rounds)",
)
args = parser.parse_args()

PLAYERS = args.players

game = None

loaded = False
if args.read:
    loaded = True
    try:
        game = Game.load(args.read)
    except:
        path = easygui.fileopenbox(
            title="Open a match file",
            default=os.path.join("matches", "*.qwark"),
            filetypes=[["*.qwark", "QWARK files"]],
        )
        if path and path.endswith(".qwark"):
            try:
                game = Game.load(path)
                loaded = True
            except:
                pass
if not game:
    if len(PLAYERS) == 0:
        t = ""
        while True:
            t = input("Enter a player name (or nothing to start): ")
            if not t:
                break
            PLAYERS.append(t)
    game = Game(PLAYERS, speed=args.speed)


def save():
    global game
    if not os.path.exists("matches"):
        os.mkdir("matches")
    game.save(
        os.path.join(
            "matches", f"{round(time.time())}-{'-'.join(game.teamInfo.keys())}.qwark"
        )
    )


if args.headless:
    while True:
        game.update()
        if game.gameOver:
            if game.winner:
                print(f"{game.winner} wins by {game.outcome} on round {game.roundNum}!")
            else:
                print(f"Tie between {", ".join(game.tieTeams)}!")
            if not loaded:
                save()
            sys.exit()
        if game.roundNum % 10 == 0:
            print(f"Finished round {game.roundNum}")

INF_RUN = len(PLAYERS) == 1 and not args.read

pygame.display.set_icon(
    pygame.transform.scale(
        pygame.image.load(os.path.join("images", "logo.png")), (32, 32)
    )
)

pygame.init()

pygame.display.set_caption("QWARKS")

screen = pygame.display.set_mode((1500, 800), pygame.RESIZABLE)

DRAW_SIZE = 50

font64 = pygame.font.Font(os.path.join("fonts", "CourierPrime-Regular.ttf"), 64)
font32 = pygame.font.Font(os.path.join("fonts", "CourierPrime-Regular.ttf"), 32)
font16 = pygame.font.Font(os.path.join("fonts", "CourierPrime-Regular.ttf"), 16)
font8 = pygame.font.Font(os.path.join("fonts", "CourierPrime-Regular.ttf"), 8)
font4 = pygame.font.Font(os.path.join("fonts", "CourierPrime-Regular.ttf"), 4)
font2 = pygame.font.Font(os.path.join("fonts", "CourierPrime-Regular.ttf"), 2)

ZOOM_LEVEL = 1

ACTION_COLORS = {
    "attack": (255, 0, 0),
    "boost": (0, 0, 255),
    "collect": (0, 255, 0),
    "sense": (255, 255, 255),
    "transfer": (255, 0, 255),
    "spawn": (0, 255, 255),
}


def getFontForText(text, overrideZoom=0):
    global ZOOM_LEVEL
    zoom = overrideZoom if overrideZoom > 0 else ZOOM_LEVEL
    if zoom == 1:
        if len(text) < 3:
            return font32
        elif len(text) < 5:
            return font16
        return font8
    elif zoom == 2:
        if len(text) < 3:
            return font16
        elif len(text) < 5:
            return font8
        return font4
    elif zoom == 3:
        if len(text) < 3:
            return font8
        elif len(text) < 5:
            return font4
        return font2
    else:
        return font2


def numToText(num):
    num = round(num, 2)
    if num > 1000000000000000000000000:
        return str(round(num / 1000000000000000000000000, 2)) + "e+24"
    elif num > 1000000000000000000000:
        return str(round(num / 1000000000000000000000, 2)) + "e+21"
    elif num > 1000000000000000000:
        return str(round(num / 1000000000000000000, 2)) + "e+18"
    elif num > 1000000000000000:
        return str(round(num / 1000000000000000, 2)) + "e+15"
    elif num > 1000000000000:
        return str(round(num / 1000000000000, 2)) + "T"
    elif num > 1000000000:
        return str(round(num / 1000000000, 2)) + "B"
    elif num > 1000000:
        return str(round(num / 1000000, 2)) + "M"
    elif num > 1000:
        return str(round(num / 1000, 2)) + "K"
    return str(num)


cameraOffset = [0, 0]

clock = pygame.time.Clock()

autorun = args.autorun
overlay = not args.nooverlay
showstats = not args.nostats
roundskip = args.skip

endSaved = False

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_q:
                game.save("world.qwark")
                running = False
            if event.key == pygame.K_SPACE:
                game.update()
            if event.key == pygame.K_z:
                if ZOOM_LEVEL == 1:
                    ZOOM_LEVEL = 2
                elif ZOOM_LEVEL == 2:
                    ZOOM_LEVEL = 3
                elif ZOOM_LEVEL == 3:
                    ZOOM_LEVEL = 4
                else:
                    ZOOM_LEVEL = 1
            if event.key == pygame.K_s:
                game.speed = not game.speed
            if event.key == pygame.K_1:
                game.runForRounds(5)
            if event.key == pygame.K_2:
                game.runForRounds(10)
            if event.key == pygame.K_3:
                game.runForRounds(15)
            if event.key == pygame.K_4:
                game.runForRounds(25)
            if event.key == pygame.K_5:
                game.runForRounds(50)
            if event.key == pygame.K_6:
                game.runForRounds(100)
            if event.key == pygame.K_7:
                game.runForRounds(250)
            if event.key == pygame.K_8:
                game.runForRounds(500)
            if event.key == pygame.K_9:
                game.runForRounds(1000)
            if event.key == pygame.K_0:
                game = Game(PLAYERS)
            if event.key == pygame.K_r:
                cameraOffset = [0, 0]

            if event.key == pygame.K_a:
                autorun = not autorun
            if event.key == pygame.K_o:
                overlay = not overlay
            if event.key == pygame.K_t:
                showstats = not showstats
            if event.key == pygame.K_k:
                roundskip = not roundskip

            if event.key == pygame.K_u:
                save()
            if event.key == pygame.K_l:
                path = easygui.fileopenbox(
                    title="Open a match file",
                    default=os.path.join("matches", "*.qwark"),
                    filetypes=[["*.qwark", "QWARK files"]],
                )
                if path and path.endswith(".qwark"):
                    try:
                        game = Game.load(path)
                        loaded = True
                    except:
                        pass

    if autorun:
        game.update()
        if roundskip and game.roundNum % 10 != 0:
            continue

    delta = clock.tick() / 1000

    keys = pygame.key.get_pressed()
    mousePos = pygame.mouse.get_pos()
    if keys[pygame.K_LEFT]:
        cameraOffset[0] -= 500 * delta
    if keys[pygame.K_RIGHT]:
        cameraOffset[0] += 500 * delta
    if keys[pygame.K_UP]:
        cameraOffset[1] -= 500 * delta
    if keys[pygame.K_DOWN]:
        cameraOffset[1] += 500 * delta

    screen.fill((0, 0, 0))

    stats = {}
    teamsAlive = set()

    ZOOM_DIVISOR = 2 ** (ZOOM_LEVEL - 1)
    DRAW_SIZE = 50 // ZOOM_DIVISOR

    for loc in game.energySources.keys():
        if game.energySources.get(loc, 0) > 0:
            pygame.draw.rect(
                screen,
                (255, 255, 255),
                pygame.Rect(
                    (loc[0] - 0.5) * DRAW_SIZE - cameraOffset[0] + 1,
                    (loc[1] - 0.5) * DRAW_SIZE - cameraOffset[1] + 1,
                    DRAW_SIZE - 2,
                    DRAW_SIZE - 2,
                ),
                width=math.ceil(game.energySources.get(loc, 0) / 5 / ZOOM_DIVISOR),
            )
    if overlay:
        for qwark in game.qwarks:
            for action in qwark.actions:
                color = ACTION_COLORS[action[0]]
                pygame.draw.line(
                    screen,
                    color,
                    (
                        qwark.x * DRAW_SIZE - cameraOffset[0],
                        qwark.y * DRAW_SIZE - cameraOffset[1],
                    ),
                    (
                        action[1][0] * DRAW_SIZE - cameraOffset[0],
                        action[1][1] * DRAW_SIZE - cameraOffset[1],
                    ),
                    math.ceil(4 / ZOOM_DIVISOR),
                )
    outlines = pygame.Surface(screen.get_size(), pygame.SRCALPHA)
    hover = None
    for qwark in game.qwarks:
        if qwark.team not in stats.keys():
            stats[qwark.team] = {
                "qwarks": 0,
                "energy": 0,
                "electrons": 0,
                "energyLevel": 0,
            }
        pygame.draw.circle(
            screen,
            qwark.team.color,
            (
                qwark.x * DRAW_SIZE - cameraOffset[0] + 1,
                qwark.y * DRAW_SIZE - cameraOffset[1] + 1,
            ),
            DRAW_SIZE / 2 - 2,
        )
        size = DRAW_SIZE + (math.sqrt(qwark.energy) * 5 / ZOOM_DIVISOR)
        pygame.draw.circle(
            outlines,
            (*qwark.team.color, 64),
            (
                qwark.x * DRAW_SIZE - cameraOffset[0] + 1,
                qwark.y * DRAW_SIZE - cameraOffset[1] + 1,
            ),
            size / 2 - 2,
        )
        stats[qwark.team]["qwarks"] = stats.get(qwark.team, {}).get("qwarks", 0) + 1
        stats[qwark.team]["energy"] = (
            stats.get(qwark.team, {}).get("energy", 0) + qwark.energy
        )
        stats[qwark.team]["income"] = (
            stats.get(qwark.team, {}).get("income", 0) + qwark.income
        )
        teamsAlive.add(qwark.team)
        if overlay:
            text = numToText(qwark.energy)
            if pygame.Rect(
                (qwark.x - 0.5) * DRAW_SIZE - cameraOffset[0],
                (qwark.y - 0.5) * DRAW_SIZE - cameraOffset[1],
                DRAW_SIZE,
                DRAW_SIZE,
            ).collidepoint(mousePos):
                hover = qwark
            f = getFontForText(text)
            renderSize = f.size(text)
            screen.blit(
                f.render(text, True, (0, 0, 0)),
                (
                    qwark.x * DRAW_SIZE - renderSize[0] / 2 - cameraOffset[0],
                    qwark.y * DRAW_SIZE - renderSize[1] / 2 - cameraOffset[1],
                ),
            )
    screen.blit(outlines, (0, 0))
    if not INF_RUN:
        if game.gameOver:
            if game.winner:
                print(f"{game.winner} wins by {game.outcome} on round {game.roundNum}!")
            else:
                print(f"Tie between {", ".join(game.tieTeams)}!")
            if not loaded and not endSaved:
                save()
                endSaved = True
    if showstats:
        # Hover position
        text = f"{int((mousePos[0]+cameraOffset[0]+DRAW_SIZE/2)//DRAW_SIZE)}, {int((mousePos[1]+cameraOffset[1]+DRAW_SIZE/2)//DRAW_SIZE)}"
        f = font16
        renderSize = f.size(text)
        screen.blit(
            f.render(text, True, (255, 255, 255)),
            (
                screen.get_size()[0] - renderSize[0] - 5,
                screen.get_size()[1] - renderSize[1] - 5,
            ),
        )

        # Team Stats
        x = 5
        y = 5
        DRAW_SIZE = 50
        for team in sorted(
            stats.keys(),
            key=lambda x: stats[x].get("income", 0) * 1000 + stats[x].get("energy"),
            reverse=True,
        ):
            pygame.draw.circle(
                screen,
                team.color,
                (x + DRAW_SIZE / 2, y + DRAW_SIZE / 2),
                DRAW_SIZE / 2,
            )
            text = numToText(stats[team].get("qwarks", 0))
            f = getFontForText(text, 1)
            renderSize = f.size(text)
            screen.blit(
                f.render(text, True, (0, 0, 0)),
                (
                    x + DRAW_SIZE / 2 - renderSize[0] / 2,
                    y + DRAW_SIZE / 2 - renderSize[1] / 2,
                ),
            )
            pygame.draw.circle(
                screen,
                team.color,
                (x + DRAW_SIZE / 2, y + 5 + DRAW_SIZE + DRAW_SIZE / 2),
                DRAW_SIZE / 2,
            )
            text = numToText(stats[team].get("energy", 0))
            f = getFontForText(text, 1)
            renderSize = f.size(text)
            screen.blit(
                f.render(text, True, (0, 0, 0)),
                (
                    x + DRAW_SIZE / 2 - renderSize[0] / 2,
                    y + 5 + DRAW_SIZE + DRAW_SIZE / 2 - renderSize[1] / 2,
                ),
            )
            pygame.draw.rect(
                screen,
                team.color,
                pygame.Rect(x + 5 + DRAW_SIZE, y, DRAW_SIZE, DRAW_SIZE),
            )
            text = numToText(stats[team].get("income", 0))
            f = getFontForText(text, 1)
            renderSize = f.size(text)
            screen.blit(
                f.render(text, True, (0, 0, 0)),
                (
                    x + 5 + DRAW_SIZE + DRAW_SIZE / 2 - renderSize[0] / 2,
                    y + DRAW_SIZE / 2 - renderSize[1] / 2,
                ),
            )
            x += 15 + DRAW_SIZE * 2

    if hover and overlay:
        # Indicators
        text = hover.indicatorString
        splitN = (screen.get_size()[0]-10)//16
        text = [f"{hover.team.name} *{hover.energy}*"] + [text[i:i+splitN] for i in range(0, len(text), splitN)]
        i = 0
        for t in text:
            f = font16
            renderSize = f.size(t)
            screen.blit(
                f.render(t, True, (255, 255, 255)),
                (
                    5,
                    screen.get_size()[1] - renderSize[1] - 5 - ((len(text)-i-1)*20),
                ),
            )
            i += 1
    if showstats and overlay:
        text = [f"Round {game.roundNum} FPS {round(clock.get_fps())}"]
        if game.speed:
            text += ["Speed Mode"]
        if roundskip:
            text += ["Round Skip"]
        i = 0
        for t in text:
            f = font16
            renderSize = f.size(t)
            screen.blit(
                f.render(t, True, (255, 255, 255)),
                (
                    screen.get_size()[0] - renderSize[0] - 5,
                    5+i*20,
                ),
            )
            i += 1
    pygame.display.update()
