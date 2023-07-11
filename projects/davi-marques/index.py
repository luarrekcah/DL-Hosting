import telebot
import flask
import time
import random
from telebot import types
import datetime
from datetime import timedelta
from flask import Flask
from PIL import Image, ImageDraw

TOKEN = '5996153836:AAEvoQWBET71pokmS5Rn7OidxzwszkauiTY'
GROUP_CHAT_ID = "-1001928917318"
MESSAGE_INTERVAL = 360
WARNING_TIME = 60
link_url = 'https://betbr.net/c-5n9rprPq?lang=pt'

bot = telebot.TeleBot(TOKEN)
timer_enabled = False


@bot.message_handler(commands=['comecar'])
def start_timer(message):
    global timer_enabled
    if not timer_enabled:
        timer_enabled = True
        send_warning()


@bot.message_handler(commands=['parar'])
def stop_timer(message):
    global timer_enabled
    timer_enabled = False


def get_valid_until():
    current_time = datetime.datetime.now()
    valid_until = current_time + timedelta(minutes=4)
    return (valid_until - timedelta(hours=3)).strftime("%H:%M")


def create_keyboard_markup():
    markup = types.InlineKeyboardMarkup()
    button = types.InlineKeyboardButton(text='🎁 Cadastre-se aqui', url=link_url)
    markup.add(button)
    return markup


def send_warning():
    valid_until = get_valid_until()
    message = f"⚠️ AVISO, Possível entrada \n\n⏲️ Aguarde a confirmação"
    keyboard_markup = create_keyboard_markup()
    bot.send_message(GROUP_CHAT_ID, message, reply_markup=keyboard_markup)
    time.sleep(WARNING_TIME)
    send_board()


def send_board():
    if timer_enabled:
        num_tentativas = random.randint(1, 3)
        num_bombas = random.randint(2, 4)
        num_diamonds = random.randint(2, 5)
        board = generate_board(num_diamonds)
        board_str = format_board(board)

        valid_until = get_valid_until()

        # Criar uma nova imagem com o mesmo tamanho das células
        image2 = Image.open("imagem2.png")
        image2 = image2.resize((64, 64))

        # Criação do tabuleiro como imagem
        board_image = create_board_image(board, image2)

        # Salvar a imagem em um arquivo temporário
        image_path = "board_image.png"
        board_image.save(image_path)

        # Envio do tabuleiro como foto junto com a mensagem
        with open(image_path, 'rb') as photo:
            caption = f"𝗢 𝘀𝗶𝘀𝘁𝗲𝗺𝗮 𝗴𝗲𝗿𝗼𝘂 𝗼𝘀 𝘀𝗲𝗴𝘂𝗶𝗻𝘁𝗲𝘀 𝘀𝗶𝗻𝗮𝗶𝘀:\n\n💣 Aposte com: {num_bombas} Minas\n\n{board_str}\n🎯 Tentativas: {num_tentativas}\n⏲️ Válido até: {valid_until}"
            keyboard_markup = create_keyboard_markup()
            bot.send_photo(GROUP_CHAT_ID, photo, caption=caption, reply_markup=keyboard_markup)

        time.sleep(60)
        bot.send_message(GROUP_CHAT_ID, "✅💚 𝗚𝗥𝗘𝗘𝗡𝗡𝗡𝗡𝗡!! 💚✅\n\nVamos para o proximo!", parse_mode='HTML', disable_notification=True)

        time.sleep(MESSAGE_INTERVAL - 5)
        send_warning()


def generate_board(num_diamonds):
    board = [["⚫" for _ in range(5)] for _ in range(5)]
    diamonds = random.sample(range(25), num_diamonds)
    for diamond in diamonds:
        row = diamond // 5
        col = diamond % 5
        board[row][col] = "💎"
    return board


def format_board(board):
    board_str = ""
    for row in board:
        row_str = " ".join(row)
        board_str += row_str + "\n"
    return board_str


def create_board_image(board, image2):
    cell_size = 64
    image_size = (cell_size * 5, cell_size * 5)
    image = Image.new("RGB", image_size, "white")
    for row in range(5):
        for col in range(5):
            x0 = col * cell_size
            y0 = row * cell_size
            x1 = x0 + cell_size
            y1 = y0 + cell_size
            if board[row][col] == "💎":
                diamond_image = Image.open("diamond.png")
                diamond_image = diamond_image.resize((cell_size, cell_size))
                image.paste(diamond_image, (x0, y0))
            else:
                image.paste(image2, (x0, y0))
    return image


print("Bot ativo")

bot.polling()