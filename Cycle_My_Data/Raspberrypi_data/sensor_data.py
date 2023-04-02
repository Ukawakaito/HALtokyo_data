import os
import time
import datetime
from board import SCL, SDA
from busio import I2C
from adafruit_lsm6ds import LSM6DS3
from adafruit_lis3mdl import LIS3MDL
from adafruit_bmp390 import BMP390
from google.oauth2 import service_account
from googleapiclient.discovery import build
import gps


# GoogleスプレッドシートID
SPREADSHEET_ID = "xxxxxxxxxxxxx"
# OAuth 2.0クライアントIDのJSONファイルへのパス
CLIENT_SECRET_FILE = "xxxxxx.json"
# アクセストークン
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

i2c = I2C(SCL, SDA)
lsm6ds3 = LSM6DS3(i2c)
lis3mdl = LIS3MDL(i2c)
bmp390 = BMP390(i2c)

gpsd = gps.gps(mode=gps.WATCH_ENABLE | gps.WATCH_NEWSTYLE)

credentials = service_account.Credentials.from_service_account_file(
    CLIENT_SECRET_FILE, SCOPES)
sheets_api = build("sheets", "v4", credentials=credentials)

# GPSモジュールから経度緯度の取得関数
def get_gps_data():
    while True:
        report = gpsd.next()
        if report["class"] == "TPV":
            if hasattr(report, "lat") and hasattr(report, "lon"):
                return report.lat, report.lon

# 3個のセンサーからデータを取得関数
def get_sensor_data():
    accel_data = lsm6ds3.acceleration
    gyro_data = lsm6ds3.gyro
    mag_data = lis3mdl.magnetic
    temp_data = bmp390.temperature
    pressure_data = bmp390.pressure
    altitude_data = bmp390.altitude

    return gyro_data, mag_data[0], pressure_data, altitude_data

# 空行確認関数
def find_empty_row():
    result = sheets_api.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range="Sheet1!A:A"
    ).execute()

    values = result.get("values", [])
    return len(values) + 1


# シートにデータを追加関数
def append_data_to_spreadsheet(data):
    empty_row = find_empty_row()

    now = datetime.datetime.now()
    row_data = [now.strftime("%Y-%m-%d %H:%M:%S")]
    row_data.extend(data)

    body = {
        "values": [row_data]
    }

    sheets_api.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f"Sheet1!A{empty_row}",
        valueInputOption="USER_ENTERED",
        body=body
    ).execute()


# 一分おきにget_gps_data、get_sensor_data、append_data_to_spreadsheetを実行
if __name__ == "__main__":
    while True:
        gps_data = get_gps_data()
        sensor_data = get_sensor_data()
        data = [*gps_data, *sensor_data]
        append_data_to_spreadsheet(data)
        time.sleep(60)
