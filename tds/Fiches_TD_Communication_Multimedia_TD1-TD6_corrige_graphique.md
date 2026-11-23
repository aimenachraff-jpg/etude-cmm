# Communication Multimédia - Master 2 IAA (USTO)
### Collection des Fiches de Travaux Dirigés (TD 1 à TD 6)

Td1:-------

### Fiche TD 1

**I. Audio**

**Exercice 1:**
On enregistre 1 minute de son en qualité CD (Stéréo) : $Fe = 44.1\text{ kHz}$, $N = 16\text{ bits}$.
1. Calculez le débit binaire en kbit/s.
2. Calculez la taille du fichier .wav en Mo.
3. Calculez le SNR théorique avec : $\text{SNR} \approx 6.02 \times B + 1.25\text{ dB}$. Que vaut-il pour 8 bits, 16 bits, 24 bits ?
4. On passe ce fichier en FLAC (~50% réduction) puis en MP3 128k (~91% réduction). Calculez les nouvelles tailles.

**Exercice 2:**
En téléphonie traditionnelle, la voix humaine transmise utilise des fréquences comprises entre $100\text{ Hz}$ et $3\,400\text{ Hz}$. Quelle fréquence d'échantillonnage minimale $Fe$ doit-on choisir ?

**Exercice 3:**
Numérisez $v(t)$, sachant que $fe = 20\text{ Hz}$ et $B = 5\text{ bits}$. On reportera $Te$, $Q$, les valeurs binaires, et on indiquera l'erreur de quantification $e$.

$$\text{Graphique du signal } v(t) :$$




.


![Graphique du signal analogique v(t), de 0 à 2 secondes, avec amplitude comprise entre -1 et 1.](![alt text](image.png))



.


*Le graphique ci-dessus remplace le dessin ASCII afin de rendre la courbe lisible.*
*La numérisation demandée se fait avec $f_e=20\,\text{Hz}$, donc $T_e=0,05\,\text{s}$.*



**Exercice 4:**
On dispose d'un fichier/flux audio stéréo, d'une durée de 4 min 15 s et d'une résolution de 16 bits et une fréquence d'échantillonnage de $100\text{ Hz}$. Quelle est la taille du fichier/flux Audio ?

**Exercice 5:**
On dispose d'un fichier/flux audio stéréo, d'une durée de 3 min 30 s et d'une résolution de 16 bits. La taille du fichier est de $290\text{ Mo}$. Quelle est la fréquence d'échantillonnage de ce fichier/flux audio ?

**Exercice 6:**
On dispose d'un fichier/flux audio mono, d'une durée de 10 min et d'une résolution de 8 bits.

**Exercice 7:**
On dispose d'un fichier/flux audio stéréo, numérisé avec $44.1\text{ kHz}$ et une résolution de 16 bits. La taille du fichier est de $300\text{ Mo}$ (ou $325\text{ Mo}$). Quelle est sa durée ?

**Exercice 8:**
On dispose d'un fichier audio stéréo, numérisé avec une fréquence d'échantillonnage de $96.0\text{ kHz}$ et une résolution de 16 bits. La taille du fichier est de $200\text{ Mo}$. Quelle est la durée de ce fichier audio ?

**Exercice 9:**
Quel sera la taille d'un fichier audio en stéréo, d'une durée d'une heure et 20 min, encodé à $44\,100\text{ Hz}$ (qualité CD audio) en 16 bits ? À quoi cette quantité trouvée correspond-t-elle ?

**Exercice 10:**
Débit binaire $256\text{ Kbps}$. Fréquence $= 44\,100\text{ Hz}$, Mono, Taille du fichier $600\text{ Mo}$. Quelle est la résolution utilisée (Nombre de bits) ?

**Exercice 11:**
Donnez trois possibilités pour $\text{BitRate Audio} = 512\text{ Kbps}$ en CBR.

**Exercice 12:**
Une communication Audio de 5 minutes en VBR, dont: $\text{BitRate Appel} = 128\text{ Kbps}$, $\text{BitRate Silence} = 16\text{ Kbps}$. Sachant que le silence durant l'appel était d'environ 90 secondes. Quelle est la consommation de la bande passante durant cet appel? Quel était la consommation si on utilisait CBR avec $128\text{ Kbps}$?

**Exercice 13:**
Ouvrir n'importe quel logiciel de conversion Audio Professionnel (Exemple: Audacity sur PC, ou Audio Converter Pro sur mobile). Nous allons maintenant faire quelques manipulations qui vont nous permettre d'illustrer les variations de qualité de l'objet multimédia audio que nous pourrions obtenir selon les propriétés des dispositifs d'acquisition et des codages de base. Choisir une séquence audio WAV, et essayez de la convertir en $256\text{ Kbps}$, Que pensez vous de la qualité de son? Maintenant essaie de la convertir en $8\text{ Kbps}$, Que pensez vous de la qualité de son? Prenez le dernier fichier (de $8\text{ Kbps}$) et essaie de le convertir une autre fois en $256\text{ Kbps}$, Que pensez vous de la qualité de son obtenu? et Pourquoi?

**Exercice 14:**
Il s'agit de comparer le format 8 bits et 32 bits en utilisant un fichier WAV. Écoutez les deux fichiers obtenus. Que se passe-t-il ? Quelles sont les tailles des fichiers ? Pourquoi ?

**Exercice 15:**
Convertir une séquence Audio en : WAV ($512\text{ Kbps}$), MP3 ($96\text{ Kbps}$) et GSM Quality ($13\text{ Kbps}$).
Puis dans un tableau, vous donnerez vos conclusions en ce qui concerne la qualité des sons compressés obtenus et la taille des fichiers. Que pouvez-vous conclure sur les performances de chacun de ces codecs audio ?

**Exercice 16:**
Quelle est la taille d'un fichier audio en codage Audio CD de 15 min?
- A. $120.69\text{ Mo}$
- B. $151.4\text{ Mo}$
- C. $210.54\text{ Mo}$
- D. $285.90\text{ Mo}$

Td2:-------

### Fiche TD 2

**Exercice 1:**
Pour une image avec des intensités: 21, 95, 169 et 243; et des probabilités respectives $3/8$, $1/8$, $1/8$, et $3/8$;
Générer un arbre de Huffman binaire et proposer le codage correspondant.

**Exercice 2:** Soit l'image suivante :
$$
\begin{pmatrix}
127 & 63 & 63 & 63 & 255 & 255 & 127 & 127 \\
127 & 127 & 0 & 0 & 0 & 0 & 63 & 127 \\
127 & 63 & 0 & 255 & 255 & 0 & 63 & 127 \\
127 & 63 & 0 & 255 & 255 & 0 & 63 & 127 \\
127 & 127 & 0 & 0 & 0 & 0 & 63 & 127 \\
127 & 127 & 0 & 0 & 0 & 0 & 63 & 127 \\
127 & 63 & 63 & 63 & 63 & 63 & 127 & 127 \\
127 & 63 & 63 & 63 & 127 & 127 & 127 & 127
\end{pmatrix}
$$
1. À partir de l'image ci-dessus, calculez les fréquences des niveaux de gris.
2. Créez un arbre de codage de Huffman basé sur ces fréquences.
3. Attribuez des codes de Huffman à chaque niveau de gris.
4. Remplacez les niveaux de gris de l'image par les codes de Huffman.

**Exercice 3:**
On souhaite transmettre un flux vidéo non compressé composé d'une définition de $1920 \times 1080$ pixels (Full HD), avec une profondeur de couleur de 24 bits par pixel, à une cadence de 30 images par seconde (fps).
Quel est le débit binaire de ce flux vidéo en mégabits par seconde ($\text{Mb/s}$) ?

**Exercice 4:**
Le format $1280 \times 720$ points en 25 images/seconde est un format standard pour la télévision haute définition, la luminance est codée en 8 bits, et un seul signal de chrominance est numérisé sur 4 bits. Quel est le débit avant compression ?

**Exercice 5:**
Nous proposons une séquence vidéo de 2 min (25 i/s) dont la taille du fichier est $60\text{ Mo}$.
- Nous utilisons MPEG1 pour compresser cette vidéo, dont $B=20\%$ d'une image avant compression, $P=50\%$ et $I=100\%$, en utilisant le codage: IBBPBBIBBP
- Quelle est la taille du GOP utilisé?
- Calculez la taille du fichier généré (compressé).

Td3:-------

### Fiche TD 3

**Exercice 1:**
a) À quelle couche ajoute-t-on le PTS/DTS ?
b) Cite 1 protocole de transport pour VOD et 1 pour temps réel interactif.

**Exercice 2:**
Tu reçois dans l'ordre d'arrivée :
- PES 1 : $\text{DTS}=0\text{ms}$, $\text{PTS}=80\text{ms}$, $\text{Type}=I$
- PES 2 : $\text{DTS}=40\text{ms}$, $\text{PTS}=40\text{ms}$, $\text{Type}=P$
- PES 3 : $\text{DTS}=80\text{ms}$, $\text{PTS}=0\text{ms}$, $\text{Type}=B$

1. Quel est l'ordre de décodage ? L'ordre d'affichage ?
2. Si l'audio a $\text{PTS}=0\text{ms}$, $40\text{ms}$, $80\text{ms}$, quel paquet vidéo s'affiche avec quel paquet audio ? C'est quoi le Lip Sync ?
3. Pourquoi le DTS de la frame B est après son PTS ?

**Exercice 3:**
On veut diffuser un cours en live à l'université :
- Cas 1 : 5000 étudiants dans 1 amphi avec TNT interne.
- Cas 2 : 500 étudiants en fibre à travers l'Algérie avec box IPTV.
- Cas 3 : 50 000 étudiants sur internet mobile 4G.

Pour chaque cas : quel mode topologique tu choisis : Broadcast / Multicast / Unicast ? Justifie.

**Exercice 4:**
Tu dois concevoir :
a) Une plateforme type Netflix
b) Une appli visio type Meet

Pour chaque : Protocole de transport (TCP ou UDP ? Pourquoi ?), taille de buffer (20s ou 150ms ?), encapsulation (fMP4/HLS ou RTP ?), gestion de la perte de paquet.

Calcule la latence de bout en bout pour b) si : $\text{capture}=20\text{ms} + \text{encodage}=30\text{ms} + \text{réseau}=40\text{ms} + \text{jitter buffer}=60\text{ms} + \text{décodage}=20\text{ms}$.

Td4:-------

### Fiche TD 4

**Exercice 1:**
Une vidéo Full HD 1080p ($1920 \times 1080$), 30 images/sec, couleur 24 bits.
1. Calcule le débit brut en Mbit/s.
2. Si on la compresse en H.264 avec un taux de compression de 100:1, quel est le nouveau débit ?
3. Peut-on la streamer sur une ADSL de $8\text{ Mbit/s}$ ?

**Exercice 2:**
On streame une vidéo à $D_v = 5\text{ Mbit/s}$ sur un réseau qui a un débit moyen $D_r = 4\text{ Mbit/s}$ mais qui varie. Le player a un buffer initial de 10 secondes.
1. Au bout de combien de temps le buffer se vide et la vidéo freeze ?
2. Que propose DASH (Dynamic Adaptive Streaming) pour résoudre ça ?

**Exercice 3:**
Une vidéo est encodée avec audio à $48\text{ kHz}$ et vidéo à $25\text{ fps}$. Le décodeur reçoit un paquet audio avec $\text{timestamp RTP} = 48000$ et un paquet vidéo avec $\text{timestamp} = 90000$ (horloge vidéo $90\text{ kHz}$).
1. Quelle est la durée d'une trame audio (1024 échantillons) et d'une image vidéo en ms ?
2. Si l'audio arrive avec $80\text{ms}$ de retard sur la vidéo, que va percevoir l'utilisateur ? Quelle est la limite d'acceptabilité ?

**Exercice 4:**
En streaming, les paquets RTP arrivent avec une gigue de $100\text{ms}$. Vidéo à $25\text{fps}$. Quelle est la taille de buffer au lecteur ?

**Exercice 5:**
Pourquoi on ne peut pas envoyer directement le flux ES H.264 sur le réseau ? Pourquoi passer par PES puis MP4 ou TS ?

**Exercice 6:**
Calculer la taille d'un film 1h en 1080p 24 en :
a) Brut
b) MP4 YouTube 4,5 Mbps vidéo + AAC 128k

Td5:-------

### Fiche TD 5

**Exercice 1:** Soient les mesures d'une configuration VoIP :
- Encodage G.711 : $20\text{ ms}$
- Paquétisation: $20\text{ ms}$
- Traversée réseau IP: $80\text{ ms}$
- Jitter buffer côté récepteur: $40\text{ ms}$
- Décodage: $20\text{ ms}$
1. Calculer la latence totale bout-en-bout.
2. La norme ITU G.114 recommande $<150\text{ ms}$ optimal, $<400\text{ ms}$ acceptable. Comment qualifies-tu cet appel?
3. Le réseau se dégrade à $120\text{ ms}$. Propose 3 actions concrètes pour rester $<200\text{ ms}$.

**Exercice 2:** Un récepteur RTP mesure les délais d'arrivée de 6 paquets: 20, 35, 22, 60, 25, 80 ms.
1. Calculer la gigue (variation).
2. Si le jitter buffer est fixé à $50\text{ ms}$, combien de paquets sont considérés perdus ?
3. Pourquoi un buffer adaptatif est-il meilleur ?

**Exercice 3:**
Une conférence de 12 participants en SFU: chacun envoie 1 flux $2.5\text{ Mb/s}$ (1080p H.264 vidéo) + $64\text{ kb/s}$ audio Opus.
1. Bande montante par client ?
2. Bande descendante par client (reçoit 11 flux) ?
3. Charge totale sur serveur SFU ? Compare avec MCU qui transcoderait tout en 1 flux.

**Exercice 4:**
Réseau 4G varie: $5\text{ Mb/s} \rightarrow 1\text{ Mb/s} \rightarrow 300\text{ kb/s} \rightarrow 4\text{ Mb/s}$ en 10 secondes.
On diffuse en HLS/DASH avec 3 rendus: 1080p@3 Mb/s, 720p@1.5 Mb/s, 360p@400 kb/s.
1. Que doit faire le player à chaque changement ?
2. Que se passe-t-il si tu restes en 1080p à $0.3\text{ Mb/s}$ ?

**Exercice 5:** Perte de l'image I dans MPEG
$\text{GOP} = I\,\text{BBP}\,\text{BBP}\,\text{BBP}\,\text{BB}$ ($12\text{ images}$, $I=150\text{ Ko}$, $P=60\text{ Ko}$, $B=20\text{ Ko}$).
1. Que passe-t-il si:
- Tu perds un B?
- Tu perds un P?
- Si tu perds I: conséquence sur tout le GOP?
2. Pourquoi on envoie I régulièrement en streaming live ?

**Exercice 6:**
Le système a un encodage vidéo $\text{H.264} = 120\text{ ms}$, encodage audio $\text{Opus} = 20\text{ ms}$, réseau identique.
1. Calculer le décalage initial.
2. Comment RTCP Sender Report (SR) avec timestamps NTP permet de resynchroniser côté récepteur ?

**Exercice 7:**
3 sites en visioconf avec latences différentes: Site A $40\text{ ms}$, B $100\text{ ms}$, C $180\text{ ms}$.
Comment assurer que tous voient la même image au même moment ?

**Exercice 8:** Cahier des charges
Tu dois concevoir un système de télémédecine pour hôpital Oran: visioconf médecin-patient 1080p, partage d'images JPEG DICOM, enregistrement.
Contraintes: latence $<150\text{ ms}$, perte $<0.5\%$, bande hôpital $100\text{ Mb/s}$ symétrique, sécurité HIPAA, 20 consultations simultanées.
Proposer :
- Les codecs
- Les protocoles
- Et la QoS, chiffrement, dimensionnement bande, architecture.

Td6:-------

### Fiche TD 6

**Exercice 1:**
Un abonné analogique est numérisé en PCM G.711 $64\text{ kb/s}$.
1. Pourquoi $64\text{ kb/s}$ ? Expliquer l'échantillonnage et la quantification.

**Exercice 2:**
Un central local a 2000 abonnés. Taux de simultanéité $10\%$, et un $\text{E1} = 30\text{ canaux voix}$ ($2.048\text{ Mb/s}$).
1. Combien d'E1 vers le central de transit ?
2. Combien de centraux de transit si un transit gère $20\text{ E1}$ ?

**Exercice 3:**
On a 50 appels simultanés:
G.711 $= 87.2\text{ kb/s}$ avec overhead, Opus $32\text{ kb/s} = 40\text{ kb/s}$ avec overhead.
1. Calcule bande totale pour chaque codec.
2. Quel codec choisir en interne vs externe ?

**Exercice 4:**
On a 6 participants à une audioconférence.
1. Calcule la charge CPU et bande passante pour MCU et SFU.
2. Quand choisir MCU ?

**Exercice 5:**
1. Quelle est la différence entre DVI-D et DVI-A (analogique) et DVI-I ?
2. Single Link vs Dual Link ?
3. Quelle est la résolution max en Single ?

**Exercice 6:**
Soit un PC avec sortie DVI-D relié à écran VGA avec adaptateur simple, est-il possible ? Pourquoi ? Il faut DVI-I ou convertisseur actif ?

**Exercice 7:**
Soit les deux images 1080i60 et 1080p30.
Quel est l'avantage d'interlacé en 2000 ? Pourquoi on est passé tout progressif aujourd'hui ?