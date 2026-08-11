-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'KADER');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "StatusBbU" AS ENUM ('SK', 'K', 'N', 'L');

-- CreateEnum
CREATE TYPE "StatusTbU" AS ENUM ('SP', 'P', 'N', 'T');

-- CreateEnum
CREATE TYPE "StatusBbTb" AS ENUM ('SK', 'K', 'N', 'G');

-- CreateEnum
CREATE TYPE "Kemandirian" AS ENUM ('A', 'B', 'C');

-- CreateTable
CREATE TABLE "posyandu" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "desa" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posyandu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kader" (
    "id" TEXT NOT NULL,
    "posyandu_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'KADER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balita" (
    "id" TEXT NOT NULL,
    "posyandu_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT,
    "tanggal_lahir" DATE NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "nama_ibu" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pemeriksaan_balita" (
    "id" TEXT NOT NULL,
    "balita_id" TEXT NOT NULL,
    "tanggal_periksa" DATE NOT NULL,
    "usia_bulan" INTEGER NOT NULL,
    "berat_badan" DECIMAL(5,2) NOT NULL,
    "tinggi_badan" DECIMAL(5,2) NOT NULL,
    "lingkar_kepala" DECIMAL(5,2),
    "lingkar_lengan" DECIMAL(5,2),
    "status_bb_u" "StatusBbU" NOT NULL,
    "status_tb_u" "StatusTbU" NOT NULL,
    "status_bb_tb" "StatusBbTb" NOT NULL,
    "status_kms" TEXT,
    "vitamin_a" BOOLEAN NOT NULL,
    "asi_eksklusif" BOOLEAN,
    "obat_cacing" BOOLEAN,
    "status_imunisasi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pemeriksaan_balita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lansia" (
    "id" TEXT NOT NULL,
    "posyandu_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "no_bpjs" TEXT,
    "rt_rw" TEXT NOT NULL,
    "tanggal_lahir" DATE NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "alamat" TEXT NOT NULL,
    "riwayat_ht" BOOLEAN NOT NULL DEFAULT false,
    "riwayat_dm" BOOLEAN NOT NULL DEFAULT false,
    "tingkat_kemandirian" "Kemandirian" NOT NULL,
    "gangguan_mental_emosional" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lansia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pemeriksaan_lansia" (
    "id" TEXT NOT NULL,
    "lansia_id" TEXT NOT NULL,
    "tanggal_periksa" DATE NOT NULL,
    "berat_badan" DECIMAL(5,2) NOT NULL,
    "tinggi_badan" DECIMAL(5,2) NOT NULL,
    "tekanan_darah_sistol" INTEGER NOT NULL,
    "tekanan_darah_diastol" INTEGER NOT NULL,
    "gula_darah_sewaktu" DECIMAL(6,2) NOT NULL,
    "lingkar_perut" DECIMAL(5,2) NOT NULL,
    "kolesterol" DECIMAL(6,2),
    "asam_urat" DECIMAL(5,2),
    "keluhan" TEXT,
    "tindakan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pemeriksaan_lansia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kader_email_key" ON "kader"("email");

-- AddForeignKey
ALTER TABLE "kader" ADD CONSTRAINT "kader_posyandu_id_fkey" FOREIGN KEY ("posyandu_id") REFERENCES "posyandu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balita" ADD CONSTRAINT "balita_posyandu_id_fkey" FOREIGN KEY ("posyandu_id") REFERENCES "posyandu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemeriksaan_balita" ADD CONSTRAINT "pemeriksaan_balita_balita_id_fkey" FOREIGN KEY ("balita_id") REFERENCES "balita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lansia" ADD CONSTRAINT "lansia_posyandu_id_fkey" FOREIGN KEY ("posyandu_id") REFERENCES "posyandu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemeriksaan_lansia" ADD CONSTRAINT "pemeriksaan_lansia_lansia_id_fkey" FOREIGN KEY ("lansia_id") REFERENCES "lansia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
