# ☀️ Soustons-Plage Beach Weather & Vacation Forecast Engine

A modern, full-stack, Dockerized web application engineered to aggregate multi-model meteorological forecasts, oceanographic sea surface temperature data, and historical climatology for **Soustons-Plage / Océan** (`lat 43.78°N, lon -1.41°W`) for the vacation period **August 16 to August 30, 2026**.

![Soustons-Plage Weather App](https://img.shields.io/badge/Stack-Docker%20%7C%20FastAPI%20%7C%20PostgreSQL%20%7C%20React-0ea5e9?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-amber500?style=for-the-badge)

---

## 🌟 Key Features

* **🏖️ Exclusive Focus on Soustons-Plage / Océan**: Strictly targeted at the coastal Atlantic beach coordinates (`43.78°N, -1.41°W`), isolating ocean breeze and marine conditions.
* **🤖 Multi-Model Ensemble Engine**: Aggregates forecasts from the top 4 world-class meteorological providers:
  * **ECMWF IFS 0.25°** (European Centre - World #1 European Reference, 60% priority weight)
  * **GFS Seamless** (NOAA - National Weather Service USA, 20% weight)
  * **ICON Seamless** (DWD - German Weather Service, 10% weight)
  * **Météo-France Seamless** (Météo-France, 10% weight)
* **🌊 Copernicus Marine SST Integration**: Real-time Ocean Sea Surface Temperature (SST) monitoring from Mercator Ocean International satellite & buoy networks.
* **☀️ Physical Atmospheric UV Attenuation**: Calculates real beach-level effective UV index taking into account atmospheric cloud cover absorption and rain attenuation.
* **📊 Vacation Success Index (/10)**: Custom scoring algorithm prioritizing sunshine, dry weather ($0.0\text{ mm}$ rain), and ideal beach temperatures ($24^\circ\text{C}$ to $29^\circ\text{C}$).
* **🎨 Modern Oceanic Light Theme UI**: Built with React 18, Vite, TypeScript, Lucide Icons, and Tailwind CSS featuring animated rainbow API refresh controls, dynamic progress bar gauges, and qualified beach day counters.
* **📅 Interactive Day-by-Day Carousel**: Seamlessly slide between days (Aug 16 to Aug 30) and filter by time blocks: **Morning (08h-12h)**, **Afternoon (13h-18h)**, and **Evening (19h-23h)**.
* **🚀 1-Click Free Deployment**: Pre-configured `render.yaml` Blueprint file for free single-platform deployment on Render.com.

---

## 🏗️ Architecture Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS | Fluid, responsive oceanic light UI with API proxying & auto-polling |
| **Backend** | FastAPI + Async SQLAlchemy + Python 3.12 | Multi-provider ingestion engine & REST API endpoints |
| **Database** | PostgreSQL 16 | Relational storage for raw hourly weather records and daily ensemble summaries |
| **Containerization** | Docker Compose | Multi-container orchestration (`meteo_db`, `meteo_backend`, `meteo_frontend`) |

---

## 🚀 Quick Start (Local Docker Compose)

### Prerequisites
* [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Running the Application

1. **Clone the repository**:
   ```bash
   git clone git@github.com:raymond-julie/meteo.git
   cd meteo
   ```

2. **Launch all containers in detached mode**:
   ```bash
   docker compose up -d --build
   ```

3. **Access the Application**:
   * **Frontend Web UI**: [http://localhost:3000](http://localhost:3000)
   * **Backend REST API Docs**: [http://localhost:8088/docs](http://localhost:8088/docs)
   * **PostgreSQL Database**: Port `5433` (`meteo_user` / `meteo_password`)

---

## 🛰️ Multi-Model Ensemble & Scoring Logic

### Vacation Score Algorithm (/10)
Each day begins with a base score of **10.0 / 10**:
* **Rainfall Penalty**: $-6.0$ pts if rain $\ge 5.0\text{ mm}$, $-3.5$ pts if rain $\ge 0.5\text{ mm}$, $-1.0$ pt if rain $> 0.0\text{ mm}$.
* **Cloud Cover Penalty**: $-3.5 \times (\% \text{Cloud Cover} / 100)$.
* **Beach Thermal Bonus**: $+0.5$ pt if apparent temp $\ge 25.0^\circ\text{C}$, $-1.0$ pt if $< 18.0^\circ\text{C}$.

### Qualified Beach Days Definition
A day is counted as a **"Journée Favorable Plage"** if:
1. **Score $\ge 8 / 10$** (Grand Soleil / Excellent) OR
2. **Score $\ge 6 / 10$** AND **Cloud Cover $\le 60\%$** AND **Rain $= 0.0\text{ mm}$** AND **Effective UV $\ge 3.0$**.

---

## ☁️ Free Deployment on Render.com (1-Click Blueprint)

This project includes a ready-to-use [`render.yaml`](./render.yaml) file for **100% free deployment on a single platform**:

1. Push this repository to **GitHub**.
2. Go to **[dashboard.render.com](https://dashboard.render.com)**.
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Connect your GitHub repository.
5. Render automatically provisions the PostgreSQL database, Docker backend, and React static frontend under a single dashboard!

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Engineered with ❤️ for Soustons-Plage Vacationers.*
