# Strato Server

Die Container sind momentan auch öffentlich über `217.154.206.223` erreichbar

# Processing-Unit

Beinhaltet bis jetzt nur Logik für die Perfomance und um Personen abzufragen. Die Personen sind lediglich da, damit eine Abfrage auf die Datenbank möglich ist. Heißt nicht, dass Anwendung am Ende auch bezüglich Personen ist.

## Performance

Die PUs senden alle 5 Sekunden Performance Daten an die Middleware. Das hat dann die Vorteile:

- Die PUs können selber Perfomance Metriken wie Requests pro Sekunde, CPU-Auslastung, usw. bestimmen
- Middleware kann Performancedaten verwenden um zu entscheiden, wann eine neue PU dazugeschalten werden sollte
- Da es ein fester Intervall ist, kann Middleware so auch bestimmen, welche PUs abgestürzt sind und diese aus dem Messaging-Grid entfernen

## Person

Mock Endpunkte zum Schreiben und Lesen von beliebigen Daten

# Middleware

Die Middleware besteht auch aus mehreren Teilen

## Messaging-Grid

Beim Start einer PU, verbindet sich diese mit Hazelcast und registriert sich bei der Middleware. Das Messaging-Grid speichert die PU Namen und Ports. Dadurch können Requests an PUs weitergeleitet werden. Bisher bietet das Messaging-Grid eine Round-Robin Verteilung der Anfragen an.

## Deployment Manager

Beinhaltet Code zum Starten und Stoppen von PUs. Zudem auch ein rudimentäres Monitor-Skript, welches anhand der Requests pro Sekunde neue PUs ein- bzw ausschaltet.

## Simulator

Ein einfaches Skript, welches höhere Lasten der PUs simulieren soll. Sendet Anfragen in einem gewissen Intervall an die Middleware selbst und misst die Antwortzeiten.
