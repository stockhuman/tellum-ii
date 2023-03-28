#include <Keypad.h>

const byte ROWS = 4;
const byte COLS = 3;

char hexaKeys[ROWS][COLS] = {
  {'1', '2', '3'},
  {'4', '5', '6'},
  {'7', '8', '9'},
  {'*', '0', '#'}
};

byte rowPins[ROWS] = {9, 8, 7, 6};
byte colPins[COLS] = {5, 4, 3};

Keypad keypad = Keypad(makeKeymap(hexaKeys), rowPins, colPins, ROWS, COLS);

const int HOOKOUT = 12;
const int HOOKSENSE = 11;

bool hookState = false;

void setup() {
  Serial.begin(9600);
  pinMode(HOOKOUT, OUTPUT);
  pinMode(HOOKSENSE, INPUT_PULLUP);
  digitalWrite(HOOKOUT, LOW);
  keypad.addEventListener(keypadEvent); // Add an event listener for this keypad
}

void loop() {
  char key = keypad.getKey();
  int state = digitalRead(HOOKSENSE);
  if (state != hookState) {
    Serial.println(state ? "hook" : "unhook");
    hookState = state;
  }
  delay(10);
}

// Taking care of some special events.
void keypadEvent(KeypadEvent key){
  switch (keypad.getState()){
  case PRESSED:
    Serial.print("pressed ");
    Serial.println(key);
    break;

  case RELEASED:
    Serial.print("released ");
    Serial.println(key);
    break;

  case HOLD:
    Serial.print("held ");
    Serial.println(key);
    break;
  }
}