import { useSession } from "@/pages/api/sessionContext";
import DaysBetween, { FirstDayInPeriod, frmNumber, generateNUDivisi, oneToOneNumber, overQTYAll, ResetTime, tanpaKoma } from "@/utils/routines";
import { faBackward, faCancel, faCircleMinus, faCirclePlus, faFileArchive, faMagnifyingGlass, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tab } from "@headlessui/react";
import moment from "moment";
import Swal from "sweetalert2";

// New Me
import {
    GETAkunJurnalById,
    GETCekSubledger,
    GETCekSubledgerByAkunId,
    GETDetailDaftarSpmDlg,
    GETDetailJurnalSJ,
    GETDetailSj,
    GETEntitasPajak,
    GETGetDept,
    GETGetKendaraanKirim,
    GETGetNamaLedger,
    GETGetPengemudi,
    GETHppSj,
    GETIsCetakDokumen,
    GETListGudangForFilter,
    GETListTimbangSj,
    GETListViaPengiriman,
    GETMasterDaftarSpmDlg,
    GETMasterSj,
    GETPreferensi,
    GETStatusIsPakai,
    GETUsersAkses,
    PATCHUpdateSj,
    POSTSimpanAudit,
    POSTSimpanSj,
} from "@/lib/api";
import { showCustomConfirm, showErrorPopup } from "@/utils/global/template";
import { IMasterSj } from "@/utils/types";
import { LinearProgress } from "@mui/material";
import { ChangeEventArgs as ChangeEventArgsCalendar, DatePickerComponent, Inject, MaskedDateTime } from "@syncfusion/ej2-react-calendars";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { DialogComponent } from "@syncfusion/ej2-react-popups";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import GridDataBarang from "../GridDataBarang";
import GridDataJurnal from "../GridDataJurnal";
import DialogAlamatKirim from "./DialogAlamatKirim";
import DialogCustomer from "./DialogCustomer";
import DialogDaftarSpm from "./DialogDaftarSpm";
import DialogNoAkun from "./DialogNoAkun";
import DialogSubledger from "./DialogSubledger";
import DialogSuppJurnal from "./DialogSuppJurnal";

interface Props {
    onClose: () => void;
    jenis: "baru" | "edit";
    kodeSj?: string;
    visible: boolean;
}

export default function DialogBaruEditSj({ onClose, jenis, kodeSj, visible }: Props) {
    const { sessionData } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? "";
    const userid = sessionData?.userid ?? "";
    const kode_user = sessionData?.kode_user ?? "";

    const [tglDokumen, setTglDokumen] = useState(moment());
    const [tglDokumenOrigin, setTglDokumenOrigin] = useState(moment());
    const [tglTrx, setTglTrx] = useState<any>(moment());
    const [cetakTunai, setCetakTunai] = useState("N");
    const [isBersihkanData, setIsBersihkanData] = useState(false);

    const tagSaveDocRef = useRef("");
    let xTotalHpp: any = useRef(0);
    const [selectedNamaCust, setSelectedNamaCust] = useState("");
    const [selectedKodeCust, setSelectedKodeCust] = useState("");
    const [selectedKodeSj, setSelectedKodeSj] = useState("");
    const [fillGudang, setFillGudang] = useState<any[]>([]);
    const [fillEkspedisiVia, setFillEkspedisiVia] = useState<any[]>([]);
    const [fillDept, setFillDept] = useState<any[]>([]);
    const [fillNopol, setFillNopol] = useState<any[]>([]);
    const [fillPengemudi, setFillPengemudi] = useState<any[]>([]);
    const [diskonDok, setDiskonDok] = useState("");

    const [kodeDok, setKodeDok] = useState<any>("");
    const [statusDok, setStatusDok] = useState<string>("");
    const [noDok, setNoDok] = useState<any>("");
    const [kodeGudang, setKodeGudang] = useState("");
    const [expedisiVia, setExpedisiVia] = useState("");
    const [pengemudi, setPengemudi] = useState("");
    const [nopol, setNopol] = useState("");
    const [alamatKirim, setAlamatKirim] = useState("");
    const [kodePajak, setKodePajak] = useState("");
    const [kodeMu, setKodeMu] = useState("");
    const [kurs, setKurs] = useState("");
    const [tipe, setTipe] = useState("");
    const [fob, setFob] = useState("");
    const [catatan, setCatatan] = useState("");
    const [kodeDivisiJual, setKodeDivisiJual] = useState("");
    const [edNoDok, setEdNoDok] = useState("");
    const [jenisSpm, setJenisSpm] = useState("");
    const [modalDlgCustomer, setModalDlgCustomer] = useState(false);
    const [modalDlgAlamatKirim, setModalDlgAlamatKirim] = useState(false);
    const [modalDlgDaftarSpm, setModalDlgDaftarSpm] = useState(false);
    const [noCust, setNoCust] = useState("");
    const [namaGudang, setNamaGudang] = useState("");
    const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const mounted = useRef(false);
    const [selisih, setSelisih] = useState(0);

    const [dataMaster, setDataMaster] = useState({ nodes: [] as IMasterSj[] });
    const [dataDetail, setDataDetail] = useState<any>({ nodes: [] });
    const [dataTimbang, setDataTimbang] = useState({ nodes: [] });
    const [selectcellid_sjValue, setselectcellid_sjValue] = useState<any>("");
    const [rowid, setRowId] = useState<any>(0);
    const [totalNum, setTotalNum] = useState(0);
    const [tipeValue, setTipeValue] = useState("");
    const [modalAkunDlg, setModalAkunDlg] = useState(false);
    const [modalSjDlg, setModalSjDlg] = useState(false);
    const [nilaiValueNoItem, setNilaiValueNoItem] = useState("");
    const [nilaiValueNamaItem, setNilaiValueNamaItem] = useState("");
    const [nilaiKodeItem, setKodeItem] = useState("");

    // ===============JURNAL===============
    const [dataJurnal, setDataJurnal] = useState({ nodes: [] });
    const [selectcellid_pbValue, setselectcellid_pbValue] = useState<any>("");
    const [nilaiValueNoAkun, setNilaiValueNoAKun] = useState("");
    const [nilaiValueNamaAkun, setNilaiValueNamaAkun] = useState("");
    // const [totalNumJu, setTotalNumJu] = useState(0);
    const [modalTipeCari, setModalTipeCari] = useState("");
    const [tipeSupp, settipeSupp] = useState("");
    const [kodeDept, setKodeDept] = useState("");
    const [modalSuppJurnal, setModalSuppJurnal] = useState(false);
    const [modalSubledger, setModalSubledger] = useState(false);
    const [totalDebet, setTotalDebet] = useState(0);
    const [totalKredit, setTotalKredit] = useState(0);
    const [listDepartemen, setListDepartemen] = useState([]);
    const [totalBeratHeader, setTotalBeratHeader] = useState(0);
    const [periode, setPeriode] = useState("");
    const [isCetakDokumen, setIsCetakDokumen] = useState(false);

    // Loading
    const [showLoadingModal, setShowLoadingModal] = useState<any>(false);
    const [isLoadingModal, setIsLoadingModal] = useState<any>(0);
    const [currentIndicator, setCurrentIndicator] = useState<any>("");
    const [errorMessage, setErrorMessage] = useState<any>("");

    const handleSelectDataCust = (
        selectedData: any,
        no_cust: any,
        S_NamaRelasi: any,
        kode_pajak: any,
        kode_mu: any,
        kurs: any,
        alamat_kirim1: any,
        tipe: any,
        cetak_tunai: any
    ) => {
        setSelectedNamaCust(S_NamaRelasi);
        setSelectedKodeCust(selectedData);
        setNoCust(no_cust);
        setKodePajak(kode_pajak);
        setKodeMu(kode_mu);
        setKurs(kurs);
        setAlamatKirim(alamat_kirim1);
        setTipe(tipe);
        settipeSupp(tipe);
        setCetakTunai(cetak_tunai);
    };

    const handleSelectedAlamat = (alamat: any, utama: any) => {
        // setSelectedAlamat(alamat);
        setAlamatKirim(alamat);
    };

    const handleSelectOnChange = (e: any, tipe: any) => {
        const selectedValue = e.target.value;
        if (tipe === "kode_gudang") {
            setKodeGudang(selectedValue);
        } else if (tipe === "via") {
            setExpedisiVia(selectedValue);
        } else if (tipe === "customer") {
            setSelectedNamaCust(selectedValue);
        } else if (tipe === "dokumen") {
        } else if (tipe === "pengemudi") {
            setPengemudi(selectedValue);
        } else if (tipe === "kendaraankirim") {
            setNopol(selectedValue);
        } else if (tipe === "alamatKirim") {
            setAlamatKirim(selectedValue);
        } else if (tipe === "catatan") {
            setCatatan(selectedValue);
        }
    };

    const getMasterFromDlgSpm = async (kode_do: any) => {
        try {
            const responseListDlgSpm = await GETMasterDaftarSpmDlg(`param1=${kode_do}`);
            // console.log(kode_do.slice(0, 2));
            const jenisSPM = kode_do.slice(0, 2);
            const response = responseListDlgSpm[0];
            // console.log("resListDlgSpm", response);
            setKodeGudang(response.kode_gudang);
            setKodeDivisiJual(response.kode_jual);
            setAlamatKirim(response.alamat_kirim);
            setExpedisiVia(response.via);
            setCatatan(response.keterangan);
            setJenisSpm(response.jenis_spm);
            setCetakTunai(response.cetak_tunai);
            setDiskonDok(response.diskon_dok);

            if (jenisSPM === "DT") {
                oneToOneNumber(response.no_do, "22", moment().format("YYYY-MM-DD"), kode_entitas) // PF_DOT = 21
                    .then((result: React.SetStateAction<string>) => {
                        // only update noDok if not in "bersihkan data" mode
                        if (jenis === "baru") {
                            setNoDok(result);
                            setEdNoDok(result);
                        }
                        // setNoDok(result);
                        // setEdNoDok(result);
                    })
                    .catch((error: any) => {
                        console.error("Error:", error);
                    });
            } else {
                await generateNUDivisi(
                    kode_entitas,
                    "",
                    response.kode_jual,
                    "12",
                    moment(tglDokumen).format("YYYYMM"),
                    moment(tglDokumen).format("YYMM") + `${response.kode_jual}`
                )
                    .then((result: React.SetStateAction<string>) => {
                        if (jenis === "baru") {
                            setNoDok(result);
                            setEdNoDok(result);
                        }
                        // setNoDok(result);
                        // setEdNoDok(result);
                        // mSetNoMPB('');
                    })
                    .catch((error: any) => {
                        console.error("Error:", error);
                    });
            }

            if (response.pengemudi === null) {
                setPengemudi("");
            } else {
                setPengemudi(response.pengemudi);
            }
            if (response.nopol === null) {
                setNopol("");
            } else {
                setNopol(response.nopol);
            }

            setFob(response.fob);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const getDetailFromDlgSpm = async (kode_do: any) => {
        try {
            const response = await GETDetailDaftarSpmDlg(`param1=${kode_do}`);
            // console.log("resDetailDaftarSpmDlg", response);
            const modifiedResponse: any = response.map((item: any, index: any) => ({
                ...item,
                qty: frmNumber(item.jml_mak),
                qty_sisa: frmNumber(item.jml_mak),
                sisa: frmNumber(item.jml_mak),
                qty_std: frmNumber(item.jml_mak),
                // total_berat: frmNumber(item.berat * item.qty),
                id_sj: index + 1,
                tgl_do: moment(item.tgl_do).format("DD-MM-YYYY HH:mm:ss"),
                no_kontrak: "",
                no_mbref: "",
                totberat: Number(item.qty) * Number(item.berat),
            }));
            // console.log("modifiedResponse", modifiedResponse);
            // setData({ nodes: modifiedResponse });

            setDataDetail({ nodes: modifiedResponse });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleSelectedData = async (dataobjekDetail: any) => {
        const baru: any = dataobjekDetail;
        setDataDetail({ nodes: baru });
        const ambilTotalRp = dataobjekDetail.reduce((total: any, detailItem: any) => total + detailItem.jumlah_rp);
        mSetTotalRp(ambilTotalRp);
        setKodeDivisiJual(dataobjekDetail[0]?.kode_jual);
        // console.log(dataobjekDetail[0]?.kode_jual);
        const jenisSPM = dataobjekDetail[0].kode_do.slice(0, 2);
        // console.log(jenisSPM);
        getMasterFromDlgSpm(dataobjekDetail[0].kode_do);
        if (jenisSPM === "DT") {
            oneToOneNumber(dataobjekDetail[0].no_do, "22", moment().format("YYYY-MM-DD"), kode_entitas) // PF_DOT = 21
                .then((result) => {
                    // only update noDok if not in "bersihkan data" mode
                    if (!isBersihkanData) {
                        setNoDok(result);
                        setEdNoDok(result);
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        } else {
            await generateNUDivisi(
                kode_entitas,
                "",
                dataobjekDetail[0].kode_jual,
                "12",
                tglDokumen.format("YYYYMM"),
                tglDokumen.format("YYMM") + `${dataobjekDetail[0].kode_jual}`
            )
                .then((result) => {
                    if (!isBersihkanData) {
                        setNoDok(result);
                        setEdNoDok(result);
                    }
                    // mSetNoMPB('');
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }
    };

    const handleSelectedDaftarSpm = async (kode_do: any) => {
        getMasterFromDlgSpm(kode_do);
        getDetailFromDlgSpm(kode_do);
    };

    let tagButton = "0";

    const handleDokumenbaru = () => {
        // console.log(tagButton);
        //   const id = Math.floor(Math.random() * (9990 - 0 + 1)) + 0;
        const id = dataDetail.nodes.length + 1;

        const newNode = {
            // id: id,
            id_sj: id,
            no_do: "",
            no_item: "",
            diskripsi: "",
            satuan: "",
            qty: "",
            // totberat: 0,
            berat: 0,
            no_kontrak: "",
            no_mbref: "",
        };

        const hasEmptyFields = dataDetail.nodes.some((row: { no_item: string }) => row.no_item === "");
        const hasQtyNol = dataDetail.nodes.some((row: { qty: number }) => row.qty <= 0);

        if (hasEmptyFields) {
            showErrorPopup("Harap isi Data sebelum tambah data.", 400, "#dialog-warning");
            throw "exit";
        } else if (hasQtyNol) {
            showErrorPopup("Jumlah tidak boleh lebih kecil atau sama dengan Nol.", 400, "#dialog-warning");
        } else {
            setDataDetail((state: any) => ({
                ...state,
                nodes: state.nodes.concat(newNode),
            }));
        }
    };

    const HandleRemoveAllRows = async (
        dataDetail: any,
        setDataDetail: Function,
        handleDokumenBaru: Function,
        setDataJurnal: Function,
        handleJurnalBaru: Function
        // setButtonDisabled: Function
    ) => {
        const isConfirmed = await showCustomConfirm({
            htmlContent: `Hapus semua data Surat Jalan untuk Customer tsb?.`,
            target: "#dialog-warning",
        });
        if (isConfirmed) {
            // console.log(dataDetail.nodes.length )
            if (dataDetail.nodes.length > 0) {
                tagButton = "1";
                const newNode = {
                    id_sj: 1,
                    no_do: "",
                    no_item: "",
                    diskripsi: "",
                    satuan: "",
                    qty: "",
                    // totberat: 0,
                    berat: 0,
                    no_kontrak: "",
                    no_mbref: "",
                };

                const hasEmptyFields = dataDetail.nodes.some((row: { diskripsi: string }) => row.diskripsi === "");
                setSelectedNamaCust("");
                setSelectedKodeCust("");
                setIsBersihkanData(true);

                if (!hasEmptyFields) {
                    await setDataDetail({ nodes: [newNode] });

                    setDataJurnal((state: any) => ({
                        ...state,
                        nodes: [],
                    }));
                    // handleSubmitJurnal();
                } else {
                    // Jika ada field yang kosong, Anda dapat menangani kasus ini di sini
                }
            } else {
                showErrorPopup("Tidak ada baris yang tersedia untuk dihapus.", 350, "#dialog-warning");
            }

            if (dataJurnal.nodes.length > 0) {
                const newNodeJurnal = {
                    kode_dokumen: "",
                    id_dokumen: 1,
                    id: 1,
                    dokumen: "SJ",
                    tgl_dokumen: "",
                    kode_akun: "",
                    no_akun: "",
                    nama_akun: "",
                    kode_subledger: "",
                    no_subledger: "",
                    nama_subledger: "",
                    kurs: 1.0,
                    kode_mu: "IDR",
                    debet_rp: "0.00",
                    kredit_rp: "0.00",
                    jumlah_rp: "0.00",
                    jumlah_mu: "0.00",
                    catatan: "",
                    persen: 0,
                    kode_dept: kodeDept,
                    kode_kerja: "",
                    approval: "N",
                    posting: "N",
                    rekonsiliasi: "N",
                    tgl_rekonsil: "",
                    userid: "",
                    tgl_update: "",
                    nama_dept: "",
                    nama_kerja: "",
                    isledger: "",
                    subledger: "",
                    tipe: "",
                    no_warkat: "",
                    tgl_valuta: "",
                    no_kerja: "",
                    total: 0,
                };
                const hasEmptyFieldsJurnal = dataJurnal.nodes.some((row: { nama_akun: string }) => row.nama_akun === "");
                setSelectedNamaCust("");
                setSelectedKodeCust("");
                setIsBersihkanData(true);
                if (!hasEmptyFieldsJurnal) {
                    await setDataJurnal({ nodes: [newNodeJurnal] });

                    setDataJurnal((state: any) => ({
                        ...state,
                        nodes: [],
                    }));
                    // handleSubmitJurnal();
                } else {
                    // Jika ada field yang kosong, Anda dapat menangani kasus ini di sini
                }
            } else {
                showErrorPopup("Tidak ada baris yang tersedia untuk dihapus.", 350, "#dialog-warning");
            }
        }
    };

    const fetchPendukung = useCallback(async () => {
        try {
            const resGudangSj = await GETListGudangForFilter(`param1=${kode_user}`);
            setFillGudang(resGudangSj);
            const resListViaPengiriman = await GETListViaPengiriman();
            setFillEkspedisiVia(resListViaPengiriman);
            const resFillDept = await GETGetDept();
            setFillDept(resFillDept);
            const resKendaraanKirim = await GETGetKendaraanKirim();
            setFillNopol(resKendaraanKirim);
            const resGetPengemudi = await GETGetPengemudi();
            setFillPengemudi(resGetPengemudi);
            const periode = await FirstDayInPeriod(kode_entitas);
            const periodeFormated = moment(periode).format("DD-MM-YYYY");
            // console.log(periodeFormated);
            setPeriode(periodeFormated);
        } catch (error) {
            console.error("Error:", error);
        }
    }, [kode_user, kode_entitas]);

    const fetchKodeGudang = useCallback(async () => {
        try {
            const resPreferensi = await GETPreferensi();
            const kodeGudang = resPreferensi[0].kode_gudang;
            setKodeGudang(kodeGudang);
            // console.log("kodeGudang", kodeGudang);
        } catch (error) {
            console.error("Error:", error);
        }
    }, []);

    useEffect(() => {
        (async () => {
            if (!mounted.current) {
                mounted.current = true;
                // console.log("MASUK SINI GAES", jenis);
                if (jenis === "baru") {
                    handleDokumenbaru();
                    setStatusDok("Terbuka");
                    setFob("Dikirim");
                    await fetchKodeGudang();
                    setIsBersihkanData(true);

                    generateNUDivisi(
                        kode_entitas,
                        "",
                        kodeDivisiJual,
                        "12",
                        tglDokumen.format("YYYYMM"),
                        tglDokumen.format("YYMM") + `${kodeDivisiJual}`
                    )
                        .then((result) => {
                            setNoDok(result);
                            setEdNoDok(result);
                            // mSetNoMPB('');
                        })
                        .catch((error) => {
                            console.error("Error:", error);
                        });
                } else if (jenis === "edit") {
                    // if (!kode_mpb === "") {
                    // EditMpb(kodeSj);
                    // setKodeDok(dataDetail.nodes[0].kode_do)
                    // console.log('dataDetail', dataDetail);
                }
                setTglDokumenOrigin(tglDokumen);
                handleSubmitJurnal();
                handleSubmitTimbang();

                // New Me
                fetchPendukung();
            }
        })();
        // eslint-disable-next-line
    }, []);

    // keep namaGudang in sync when kodeGudang is set programmatically
    useEffect(() => {
        if (kodeGudang && Array.isArray(fillGudang) && fillGudang.length > 0) {
            const found = fillGudang.find((g: any) => g.kode_gudang === kodeGudang || String(g.kode_gudang) === String(kodeGudang));
            if (found) {
                setNamaGudang(found.nama_gudang || "");
            } else {
                setNamaGudang("");
            }
        }
    }, [kodeGudang, fillGudang]);

    const tombolBaruGrid = () => {
        function handleDokumenbaru(): void {
            tagButton = "0";
            //   const id = Math.floor(Math.random() * (9990 - 0 + 1)) + 0;
            const id = dataDetail.nodes.length + 1;

            const newNode = {
                id_sj: id,
                no_do: "",
                no_item: "",
                diskripsi: "",
                satuan: "",
                qty: "",
                // totberat: '',
                berat: 0,
                no_kontrak: "",
                no_mbref: "",
            };

            const hasEmptyFields = dataDetail.nodes.some((row: { no_item: string }) => row.no_item === "");
            const hasQtyNol = dataDetail.nodes.some((row: { qty: number }) => row.qty <= 0);

            if (hasEmptyFields) {
                showErrorPopup("Harap isi Data sebelum tambah data.", 350, "#dialog-warning");
            } else if (hasQtyNol) {
                showErrorPopup("Jumlah tidak boleh lebih kecil atau sama dengan Nol.", 350, "#dialog-warning");
            } else {
                setDataDetail((state: any) => ({
                    ...state,
                    nodes: state.nodes.concat(newNode),
                }));
            }
        }
        return (
            <div className="mb-1 flex" style={{ marginLeft: "55%" }}>
                {/* buton klik tambah baru */}
                <button title="Tambah Barang" type="submit" onClick={handleDokumenbaru} style={{ display: "flex", alignItems: "center" }}>
                    <FontAwesomeIcon icon={faCirclePlus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                </button>
            </div>
        );
    };

    useEffect(() => {
        const ambilDataDetail = async () => {
            try {
                if (jenis === "edit") {
                    try {
                        // Cek apakah dok pernah dicetak
                        const resIsCetakDokumen = await GETIsCetakDokumen(`param1=${kodeSj}&param2=T`);
                        const vIsCetakDokumen = resIsCetakDokumen.length > 0 && resIsCetakDokumen[0].cnt > 0;
                        setIsCetakDokumen(vIsCetakDokumen);

                        const responseMasterSj = await GETMasterSj(`param1=${kodeSj}`);
                        // console.log("resHeader.tgl_sj", responseMasterSj);
                        const resHeader = responseMasterSj[0] || {};
                        setDataMaster({ nodes: responseMasterSj });
                        setTglDokumen(resHeader.tgl_sj);
                        setTglTrx(resHeader.tgl_trxsj);
                        setNoDok(resHeader.no_sj);
                        setSelectedKodeCust(resHeader.kode_cust);
                        setSelectedNamaCust(resHeader.nama_relasi);
                        setKodeDok(resHeader.kode_sj);
                        setKodeGudang(resHeader.kode_gudang);
                        setExpedisiVia(resHeader.via);
                        setPengemudi(resHeader.pengemudi);
                        setNopol(resHeader.nopol);
                        setAlamatKirim(resHeader.alamat_kirim);
                        setFob(resHeader.fob);
                        setCatatan(resHeader.keterangan);
                        setKodeDivisiJual(resHeader.kode_jual);
                        setKodePajak(resHeader.kode_pajak);
                        setKodeMu(resHeader.kode_mu);
                        setKodeMu(resHeader.kode_mu);
                        setTotalBeratHeader(resHeader.total_berat);
                        setCetakTunai(resHeader.cetak_tunai);
                        setStatusDok(resHeader.status);
                        // console.log("resHeader", resHeader);

                        // New Me
                        const resDetailSj = await GETDetailSj(`param1=${kodeSj}`);
                        const modifiedEditDetail = resDetailSj.map((bebas: any) => {
                            return {
                                ...bebas,
                                qty: frmNumber(bebas.qty),
                            };
                        });
                        setDataDetail({ nodes: modifiedEditDetail });
                        //   console.log('result[0].kode_do' , result[0].kode_do);

                        const resDetailJurnal = await GETDetailJurnalSJ(`param1=${kodeSj}`);
                        var resultKonversi: any = resDetailJurnal.map((node: any) => ({
                            ...node,
                            // debet_rp: node.debet_rp.includes(',') ? parseFloat(tanpaKoma(node.debet_rp)) : parseFloat(node.debet_rp),
                            // parseFloat(tanpaKoma(node.debet_rp)),
                            // kredit_rp: node.kredit_rp.includes(',') ? parseFloat(tanpaKoma(node.kredit_rp)) : parseFloat(node.kredit_rp),
                            // parseFloat(tanpaKoma(node.kredit_rp)),
                            // jumlah_mu: parseFloat(tanpaKoma(node.jumlah_mu)),
                            // jumlah_rp: parseFloat(tanpaKoma(node.jumlah_rp)),
                            debet_rp: frmNumber(node.debet_rp),
                            kredit_rp: frmNumber(node.kredit_rp),
                            jumlah_mu: frmNumber(node.jumlah_mu),
                            jumlah_rp: frmNumber(node.jumlah_rp),
                        }));
                        setDataJurnal({ nodes: resultKonversi });

                        const resListTimbangSj: any = await GETListTimbangSj(`param1=DO&param2=Y&param3=${resDetailSj[0].kode_do}`);
                        if (resListTimbangSj.length > 0) {
                            // console.log('masuk sini');
                            setDataTimbang({ nodes: resListTimbangSj });
                        } else {
                            // console.log('masuk else');
                            handleSubmitTimbang();
                        }
                    } catch (error) {
                        console.error("Error fetching data master:", error);
                    }
                } else {
                    const resDetailSj = await GETDetailSj(`param1=${kodeSj}`);
                    setSelectedKodeSj("all");
                    // setSelectedKodeSj(res)
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        ambilDataDetail();
        // eslint-disable-next-line
    }, [kode_entitas, jenis, kodeSj]);

    const handleModalChange = (value: any, tipe: string, id: any) => {
        setTotalNum((prevTotal) => prevTotal + Number(id));
        setRowId(id);
        // setKodeDivisiJual('');

        if (tipe === "noDo") {
            setNilaiValueNoItem(value);
            setNilaiValueNamaItem("");
            setTipeValue(tipe);
            setModalAkunDlg(true);
        } else if (tipe === "noItem") {
            setNilaiValueNoItem("");
            setNilaiValueNamaItem(value);
            setTipeValue(tipe);
            setModalAkunDlg(true);
        } else if (tipe === "noKontrak") {
            // console.log('masukkkkk');
            setDataDetail((state: any) => ({
                ...state,
                nodes: state.nodes.map((node: any) => {
                    if (node.id === id) {
                        return {
                            ...node,
                            no_kontrak: value,
                        };
                    }
                    return node;
                }),
            }));
            // console.log(dataDetail);
        } else if (tipe === "") {
            setDataDetail((state: any) => ({
                ...state,
                nodes: state.nodes.map((node: any) => {
                    if (node.id === id) {
                        return {
                            ...node,
                            no_mbref: value,
                        };
                    }
                    return node;
                }),
            }));
        }
    };

    const handleModal = async (tipe: string, id: any, jenis_jurnal: any, kode_akun: any, kode_item: any) => {
        setRowId(id);
        // console.log(id);
        if (tipe === "noDo") {
            setModalSjDlg(true);
        } else if (tipe === "noItem") {
            setModalSjDlg(true);
            // setModalTipeCari('searchnama_akun');
        } else if (tipe === "supp_ledger") {
            const a: any = dataDetail.nodes[0];
            if (dataDetail.nodes.length > 0 && a.no_akun !== "") {
                // console.log('ada akun' + id + jenis_jurnal);
                if (jenis_jurnal === "Hutang") {
                    // setModalSuppJurnal(true);
                } else {
                    const responCekSubledger = await GETCekSubledger(`param1=${kode_akun}`);
                    // console.log(responCekSubledger[0].subledger);
                    if (responCekSubledger[0].subledger === "Y") {
                        // setModalSubledger(true);
                    } else {
                        showErrorPopup("Akun yang dipilih tidak memiliki akun subledger", 350, "#dialog-warning");
                    }
                }
            } else {
                showErrorPopup("silahkan pilih akun dulu.", 350, "#dialog-warning");
            }
        } else if (tipe === "noKontrak") {
            setKodeItem(kode_item);
            // console.log(kode_item);
            // setModalTipeCari('searchnama_akun');
        } else if (tipe === "noMbRef") {
            setKodeItem(kode_item);
            // console.log(kode_item);
            // setModalTipeCari('searchnama_akun');
        }
    };

    const handleUpdateDetailSj = (value: any, id: any, property: any) => {
        let value2: any;

        if (value.includes(",")) {
            value2 = parseFloat(tanpaKoma(value));
        } else {
            value2 = value;
        }
        // console.log('🚀 ~ handleUpdateJurnal ~ value:', value);
        setDataDetail((state: any) => {
            const updatedNodes = state.nodes.map((node: any) => {
                // console.log(node.id_dokumen);
                if (value2 === "0.00") {
                    // console.log('nothing')
                } else {
                    if (node.id_dokumen === id) {
                        if (property === "debet_rp") {
                            const debet_rp = document.getElementById("debet_rp" + node.id_dokumen) as HTMLInputElement;
                            const kredit_rp = document.getElementById("kredit_rp" + node.id_dokumen) as HTMLInputElement;
                            const jumlah_mu = document.getElementById("jumlah_mu" + node.id_dokumen) as HTMLInputElement;
                            if (debet_rp) {
                                debet_rp.value = frmNumber(value2);
                                kredit_rp.value = frmNumber(0);
                                jumlah_mu.value = frmNumber(value2);
                            }
                            return {
                                ...node,
                                [property]: frmNumber(value2),
                                kredit_rp: "0.00",
                                jumlah_mu: frmNumber(value2),
                                jumlah_rp: frmNumber(value2),
                            };
                        }
                        if (property === "kredit_rp") {
                            const debet_rp = document.getElementById("debet_rp" + node.id_dokumen) as HTMLInputElement;
                            const kredit_rp = document.getElementById("kredit_rp" + node.id_dokumen) as HTMLInputElement;
                            const jumlah_mu = document.getElementById("jumlah_mu" + node.id_dokumen) as HTMLInputElement;

                            if (kredit_rp) {
                                debet_rp.value = frmNumber(0);
                                kredit_rp.value = frmNumber(value2);
                                jumlah_mu.value = frmNumber(value2 * -1);
                            }
                            let jumlah_mu_modified;
                            if (jumlah_mu_modified === -0) {
                                jumlah_mu_modified = 0;
                            } else {
                                jumlah_mu_modified = value2 * -1;
                            }
                            // console.log(jumlah_mu_modified);
                            return {
                                ...node,
                                [property]: frmNumber(value2),
                                debet_rp: "0.00",
                                jumlah_mu: frmNumber(jumlah_mu_modified),
                                jumlah_rp: frmNumber(jumlah_mu_modified),
                            };
                        }
                    }
                }
                return node;
            });
            return {
                ...state,
                nodes: updatedNodes,
            };
        });
    };
    const [idRowRemove, setIdRowRemove] = useState(0);

    const handleSelectedCell = async (vid_pb: any) => {
        setselectcellid_sjValue(vid_pb);
        setIdRowRemove(vid_pb);
    };

    const handleKirimIdRemove = (idRow: any) => {
        setIdRowRemove(idRow);
    };

    const tombolHapusGrid = () => {
        // function handleSubmit(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
        async function handleHapus(): Promise<void> {
            if (dataDetail.nodes.length > 0) {
                const hasEmptyFields = dataDetail.nodes.some((row: { diskripsi: string }) => row.diskripsi === "");
                if (hasEmptyFields === true && dataDetail.nodes.length === 1) {
                    showErrorPopup(
                        "Tidak bisa menghapus baris data terakhir, sisakan setidaknya 1 baris data untuk ditampilkan.",
                        350,
                        "#dialog-warning"
                    );
                } else if (idRowRemove > 0) {
                    const isConfirmed = await showCustomConfirm({
                        htmlContent: `Hapus Data Barang Rows Id ${idRowRemove} ?`,
                        target: "#dialog-warning",
                    });
                    if (isConfirmed) {
                        setDataDetail((state: any) => ({
                            ...state,
                            nodes: state.nodes.filter((node: any) => node.id_sj !== idRowRemove),
                        }));

                        if (dataDetail.nodes.length <= 1) {
                            tombolBaruGrid();
                        }
                    }
                } else {
                    const isConfirmed = await showCustomConfirm({
                        htmlContent: `Hapus Semua Data Barang ?`,
                        target: "#dialog-warning",
                    });
                    if (isConfirmed) {
                        setDataDetail((state: any) => ({
                            ...state,
                            nodes: [],
                        }));
                        tombolBaruGrid();
                    }
                }
            }
        }
        // console.log('idRowRemove ' + idRowRemove);
        return (
            <div className="mb-1 flex" style={{ marginLeft: "55%" }}>
                {/* buton klik tambah baru */}
                <button title="Hapus Barang" type="submit" onClick={handleHapus} style={{ display: "flex", alignItems: "center" }}>
                    <FontAwesomeIcon icon={faCircleMinus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                </button>
            </div>
        );
    };

    const handleUpdateJurnal = (value: any, id: any, property: any) => {
        let value2: any;
        // console.log(value);
        // console.log(id);
        // console.log(property);
        if (value.includes(",")) {
            value2 = parseFloat(tanpaKoma(value));
        } else {
            value2 = value;
        }
        // console.log('🚀 ~ handleUpdateJurnal ~ value:', value);
        setDataJurnal((state: any) => {
            const updatedNodes = state.nodes.map((node: any) => {
                // console.log(node.id_dokumen);
                if (value2 === "0.00") {
                    // console.log('nothing')
                } else {
                    if (node.id_dokumen === id) {
                        if (property === "debet_rp") {
                            const debet_rp = document.getElementById("debet_rp" + node.id_dokumen) as HTMLInputElement;
                            const kredit_rp = document.getElementById("kredit_rp" + node.id_dokumen) as HTMLInputElement;
                            const jumlah_mu = document.getElementById("jumlah_mu" + node.id_dokumen) as HTMLInputElement;
                            if (debet_rp) {
                                // if (value.includes(',')) {
                                //     debet_rp.value = value;
                                //     jumlah_mu.value = value;
                                // } else {
                                //     debet_rp.value = frmNumber(value);
                                //     jumlah_mu.value = frmNumber(value);
                                // }
                                debet_rp.value = frmNumber(value2);
                                kredit_rp.value = frmNumber(0);
                                jumlah_mu.value = frmNumber(value2);
                            }
                            return {
                                ...node,
                                [property]: frmNumber(value2),
                                kredit_rp: "0.00",
                                jumlah_mu: frmNumber(value2),
                                jumlah_rp: frmNumber(value2),
                            };
                        }
                        if (property === "kredit_rp") {
                            const debet_rp = document.getElementById("debet_rp" + node.id_dokumen) as HTMLInputElement;
                            const kredit_rp = document.getElementById("kredit_rp" + node.id_dokumen) as HTMLInputElement;
                            const jumlah_mu = document.getElementById("jumlah_mu" + node.id_dokumen) as HTMLInputElement;

                            if (kredit_rp) {
                                // if (value.includes(',')) {
                                //     kredit_rp.value = value;
                                //     jumlah_mu.value = value;
                                // } else {
                                //     kredit_rp.value = frmNumber(value);
                                //     jumlah_mu.value = frmNumber(value * -1);
                                // }
                                debet_rp.value = frmNumber(0);
                                kredit_rp.value = frmNumber(value2);
                                jumlah_mu.value = frmNumber(value2 * -1);
                            }
                            let jumlah_mu_modified;
                            if (jumlah_mu_modified === -0) {
                                jumlah_mu_modified = 0;
                            } else {
                                jumlah_mu_modified = value2 * -1;
                            }
                            // console.log(jumlah_mu_modified);
                            return {
                                ...node,
                                [property]: frmNumber(value2),
                                debet_rp: "0.00",
                                jumlah_mu: frmNumber(jumlah_mu_modified),
                                jumlah_rp: frmNumber(jumlah_mu_modified),
                            };
                        }
                        // return {
                        //     ...node,
                        //     [property]: value,
                        //     jumlah_mu: value,
                        //     jumlah_rp: value,
                        // };
                    }
                }
                return node;
            });
            return {
                ...state,
                nodes: updatedNodes,
            };
        });
    };

    const handleselectcell = async (vid_pb: any, kode_do: any) => {
        // console.log(kode_do);
        // console.log(vid_pb);
        // getMasterFromDlgSpm(kode_do);
        setselectcellid_pbValue(vid_pb);
    };

    const handleModalAkunChange = (value: any, tipe: string, id: any) => {
        setTotalNum((prevTotal) => prevTotal + Number(id));
        setRowId(id);

        if (tipe === "tipeNoAkun") {
            setNilaiValueNoAKun(value);
            setNilaiValueNamaAkun("");
            setTipeValue(tipe);
            setModalAkunDlg(true);
        } else if (tipe === "tipeNamaAkun") {
            setNilaiValueNoAKun("");
            setNilaiValueNamaAkun(value);
            setTipeValue(tipe);
            setModalAkunDlg(true);
        } else if (tipe === "dept") {
            // setKodeDept(value);
            // console.log(value);
            // console.log(id);

            setDataJurnal((state: any) => ({
                ...state,
                nodes: state.nodes.map((node: any) => {
                    if (node.id === id) {
                        return {
                            ...node,
                            kode_dept: value,
                        };
                    }
                    return node;
                }),
            }));
        }
    };

    const handleModalAkun = async (tipe: string, id: any, jenis_jurnal: any, kode_akun: any) => {
        setRowId(id);

        // Tipe No Akun
        if (tipe === "tipeNoAkun") {
            setNilaiValueNoAKun("");
            setNilaiValueNamaAkun("");
            setModalAkunDlg(true);
            setModalTipeCari("searchno_akun");
        }

        // Tipe nama akun
        else if (tipe === "tipeNamaAkun") {
            setNilaiValueNoAKun("");
            setNilaiValueNamaAkun("");
            setModalAkunDlg(true);
            setModalTipeCari("searchnama_akun");
        }

        // SubLedger
        else if (tipe === "supp_ledger") {
            const a: any = dataJurnal.nodes[0];
            if (dataJurnal.nodes.length > 0 && a.no_akun !== "") {
                // console.log('ada akun' + id + jenis_jurnal);
                if (jenis_jurnal === "Hutang") {
                    setModalSuppJurnal(true);
                } else {
                    const responCekSubledger = await GETCekSubledger(`param1=${kode_akun}`);
                    // console.log(responCekSubledger[0].subledger);
                    if (responCekSubledger[0].subledger === "Y") {
                        setModalSubledger(true);
                    } else {
                        showErrorPopup("Akun yang dipilih tidak memiliki akun subledger", 350, "#dialog-warning");
                    }
                }
            } else {
                showErrorPopup("Silahkan pilih akun dulu", 350, "#dialog-warning");
            }
        }
    };

    const [mTotalRp, mSetTotalRp] = useState(0);

    const handleSubmitJurnal = () => {
        //   const id = Math.floor(Math.random() * (9990 - 0 + 1)) + 0;
        const id = dataJurnal.nodes.length + 1;

        const newNode = {
            kode_dokumen: "",
            id_dokumen: id,
            id: id,
            dokumen: "SJ",
            tgl_dokumen: "",
            kode_akun: "",
            no_akun: "",
            nama_akun: "",
            kode_subledger: "",
            no_subledger: "",
            nama_subledger: "",
            kurs: 1.0,
            kode_mu: "IDR",
            debet_rp: "0.00",
            kredit_rp: "0.00",
            jumlah_rp: "0.00",
            jumlah_mu: "0.00",
            catatan: "",
            persen: 0,
            kode_dept: kodeDept,
            kode_kerja: "",
            approval: "N",
            posting: "N",
            rekonsiliasi: "N",
            tgl_rekonsil: "",
            userid: "",
            tgl_update: "",
            nama_dept: "",
            nama_kerja: "",
            isledger: "",
            subledger: "",
            tipe: "",
            no_warkat: "",
            tgl_valuta: "",
            no_kerja: "",
        };

        const hasEmptyFields = dataJurnal.nodes.some((row: { no_akun: string }) => row.no_akun === "");
        const hasQtyNol = dataJurnal.nodes.some((row: { jumlah_mu: number }) => row.jumlah_mu <= 0);

        if (hasEmptyFields) {
            showErrorPopup("Harap isi Data Akun sebelum tambah data.", 350, "#dialog-warning");
            throw "exit";
        } else if (hasQtyNol) {
            showErrorPopup("Jumlah tidak boleh lebih kecil atau sama dengan Nol.", 350, "#dialog-warning");
            throw "exit";
        } else if (selisih !== 0) {
            showErrorPopup("Terdapat nilai selisih antara Debit dan Kredit.", 350, "#dialog-warning");
            throw "exit";
        } else {
            setDataJurnal((state: any) => ({
                ...state,
                nodes: state.nodes.concat(newNode),
            }));
        }
    };

    const handleSubmitTimbang = () => {
        //   const id = Math.floor(Math.random() * (9990 - 0 + 1)) + 0;
        const id = dataTimbang.nodes.length + 1;

        const newNode = {
            dokumen: "",
            kode_dokumen: "",
            id_dokumen: "",
            tgl_timbang: "",
            kode_ikat: "",
            kode_item: "",
            diskripsi: "",
            kuantitas: "",
            berat: "",
            hitung: "",
            tanggal: "",
            jam: "",
            nama_item: "",
        };

        setDataTimbang((state: any) => ({
            ...state,
            nodes: state.nodes.concat(newNode),
        }));
    };

    const handleRemoveJurnal = async () => {
        if (dataJurnal.nodes.length === 1) {
            showErrorPopup("Tidak bisa menghapus baris data terakhir, sisakan setidaknya 1 baris data untuk ditampilkan.", 350, "#dialog-warning");
        } else {
            const isConfirmed = await showCustomConfirm({
                htmlContent: `Hapus Data Akun baris ${selectcellid_pbValue} ?`,
                target: "#dialog-warning",
            });
            if (isConfirmed) {
                setDataJurnal((state) => ({
                    ...state,
                    nodes: state.nodes.filter((node: any) => node.id !== selectcellid_pbValue),
                }));
            }
        }
    };

    const handleSelectedDataJurnal = async (dataObject: any, tipe: any) => {
        if (tipe === "akun_jurnal") {
            const { selectedkode_akun, selectedno_akun, selectednama_akun, selectedtipe } = dataObject;

            setDataJurnal((state: any) => {
                const newNodes = state.nodes.map((node: any) => {
                    if (node.id === rowid) {
                        return {
                            ...node,
                            kode_akun: selectedkode_akun,
                            no_akun: selectedno_akun,
                            nama_akun: selectednama_akun,
                            tipe: selectedtipe,
                        };
                    } else {
                        return node;
                    }
                });

                return {
                    nodes: newNodes,
                };
            });
        } else if (tipe === "supp_jurnal") {
            // hutang only
            const { selectedData, selectedNoSupp, selectedKodeSupp } = dataObject;
            // console.log(dataObject);
            setDataJurnal((state: any) => {
                const newNodes = state.nodes.map((node: any) => {
                    if (node.id === rowid) {
                        return {
                            ...node,
                            catatan: "Hutang " + selectedData + ", PB No: " + noDok,
                            nama_subledger: selectedData,
                            no_subledger: selectedKodeSupp,
                            subledger: selectedNoSupp + " - " + selectedData,
                        };
                    } else {
                        return node;
                    }
                });

                return {
                    nodes: newNodes,
                };
            });
        } else if (tipe === "subledger") {
            const { selectedAktif, selectedKode, selectedNamaSubledger, selectedNoSubledger, selectedSubledger } = dataObject;
            // console.log(dataObject);
            setDataJurnal((state: any) => {
                const newNodes = state.nodes.map((node: any) => {
                    if (node.id === rowid) {
                        return {
                            ...node,
                            catatan: "-", // sementara
                            nama_subledger: selectedNamaSubledger,
                            no_subledger: selectedNoSubledger,
                            subledger: selectedSubledger,
                        };
                    } else {
                        return node;
                    }
                });

                return {
                    nodes: newNodes,
                };
            });
        }
    };
    const parseTotal = (value: any) => {
        if (typeof value === "string" && value.includes(",")) {
            return parseFloat(value.replace(/,/g, ""));
        }
        return parseFloat(value);
    };

    useEffect(() => {
        // console.log('dataDetail.nodes. ', dataDetail.nodes);
        let debetRp;
        const totalDebetRp = dataJurnal.nodes.reduce((total: any, node: any) => {
            debetRp = parseTotal(node.debet_rp);
            return total + debetRp;
            // return total + parseFloat(tanpaKoma(node.debet_rp));
        }, 0);
        let kreditRp;
        const totalKreditRp = dataJurnal.nodes.reduce((total: any, node: any) => {
            kreditRp = parseTotal(node.kredit_rp);
            return total + kreditRp;
            // return total + parseFloat(tanpaKoma(node.kredit_rp));
        }, 0);

        // let totBerat2;
        const totalBerat = dataDetail.nodes.reduce((total: any, node: any) => {
            let nilaiTanpaKomaQty: any;

            if (typeof node.qty === "string" && node.qty.includes(",")) {
                nilaiTanpaKomaQty = parseFloat(tanpaKoma(node.qty));
            } else {
                nilaiTanpaKomaQty = parseFloat(node.qty);
            }

            const totBerat2 = parseFloat(node.berat) * nilaiTanpaKomaQty;
            return total + totBerat2;
            // return total + parseFloat(tanpaKoma(node.kredit_rp));
        }, 0);

        setTotalDebet(totalDebetRp);
        setTotalKredit(totalKreditRp);
        setSelisih(totalDebetRp - totalKreditRp);
        setTotalBeratHeader(totalBerat);
    }, [dataJurnal, dataDetail]);
    //================================END JURNAL=============================================//

    // //================================OLD START SAVE DOC=============================================//
    // const saveDoc = async () => {
    //     try {
    //         setShowLoadingModal(true);
    //         setIsLoadingModal(20);
    //         setCurrentIndicator(`Memulai proses simpan...`);
    //         let LisPakai = false;
    //         let LApp;

    //         try {
    //             // console.log(selectedKodeSj);
    //             const responseStatusPakai = await GETStatusIsPakai(`param1=${selectedKodeSj}`);
    //             const responseUsersAkses = await GETUsersAkses(`param1=${kode_user}`);
    //             LApp = responseUsersAkses[0].app_backdate;

    //             LisPakai = responseStatusPakai[0].isPakai;
    //         } catch (error) {
    //             // setErrorMessage("Gagal mengambil data status pakai atau akses user. Silakan coba lagi." + error);
    //             throw error;
    //         }

    //         let dateFake = false;
    //         let tglReff, tglDok: any;

    //         dataDetail.nodes.forEach((node: any) => {
    //             tglDok = tglDokumen; //moment(tglDokumen).format('DD-MM-YYYY HH:mm:ss');

    //             tglReff = node.tgl_do;
    //             if (tglDok < node.tgl_do) {
    //                 dateFake = true;
    //                 return;
    //             }
    //         });

    //         let kosong = false;
    //         dataDetail.nodes.forEach((node: any) => {
    //             if (node.qty === 0) {
    //                 kosong = true;
    //                 return;
    //             }
    //         });

    //         if (LisPakai !== true) {
    //             showErrorPopup("Status Dokumen " + statusDok + ", Tidak Dapat Disimpan Kembali", 350, "#dialog-warning");
    //             throw new Error("VALIDATION_STOP");
    //         } else if (tglDok < periode) {
    //             await showErrorPopup(
    //                 "Tanggal transaksi yang anda masukan lebih kecil dari periode yang dijalankan, data tidak dapat di simpan",
    //                 400,
    //                 "#dialog-warning"
    //             );
    //             throw new Error("VALIDATION_STOP");
    //         } else if (dateFake) {
    //             let vtglDok = moment(tglDokumen).format("DD-MM-YYYY HH:mm:ss");
    //             let vtglReff = moment(tglReff).format("DD-MM-YYYY HH:mm:ss");
    //             await showErrorPopup(
    //                 "Tanggal transaksi yang direferensi (" +
    //                     vtglReff +
    //                     ") lebih kecil dari transaksi dokumen ini (" +
    //                     vtglDok +
    //                     ") , data tidak bisa di simpan.",
    //                 400,
    //                 "#dialog-warning"
    //             );
    //             throw new Error("VALIDATION_STOP");
    //         }

    //         // console.log('modifiedData2');
    //         const currentDate = moment();
    //         const tanggalApp = currentDate.format("YYYY-MM-DD");

    //         const resEntitasPajak = await GETEntitasPajak(`param1=${kode_user}`);

    //         const isPajak = resEntitasPajak.some((item: any) => item.kodecabang === kode_entitas && item.pajak === "Y");

    //         if (!isPajak) {
    //             // } else if (kode_user !== ('Administrator' || 'ADMINISTRATOR' || 'administrator')) {
    //         } else if (!["Admin", "ADMIN", "admin"].includes(kode_user)) {
    //         } else if (LApp === "Y") {
    //         } else if (tglTrx > tanggalApp) {
    //             const AppDate: Date = new Date(); // Tanggal saat ini
    //             if (DaysBetween(AppDate, tglTrx) > 2) {
    //                 showErrorPopup("Tanggal kirim future date lebih besar dari 3 hari.", 350, "#dialog-warning");
    //                 throw new Error("VALIDATION_STOP");
    //             } else if (DaysBetween(tglTrx, AppDate) > 14) {
    //                 showErrorPopup("Tanggal kirim future date lebih besar dari 14 hari.", 350, "#dialog-warning");
    //                 throw new Error("VALIDATION_STOP");
    //             }
    //         }

    //         if (tglDokumenOrigin !== tglDokumen) {
    //             let tglResetDokumen;
    //             let tglResetTrxDokumen;
    //             tglResetDokumen = ResetTime(kode_entitas, tglResetDokumen);
    //             tglResetTrxDokumen = ResetTime(kode_entitas, tglResetTrxDokumen);
    //             setTglDokumen(await tglResetDokumen);
    //             setTglTrx(await tglResetTrxDokumen);
    //         }

    //         if (kosong) {
    //             showErrorPopup("Masih ada Kuantitas yang 0 atau harga yang 0", 350, "#dialog-warning");
    //             throw new Error("VALIDATION_STOP");
    //         }

    //         if (!tglDokumen) {
    //             showErrorPopup("Tanggal SJ belum diisi.", 350, "#dialog-warning");
    //             throw new Error("VALIDATION_STOP");
    //         } else if (!tglTrx) {
    //             showErrorPopup("Tanggal Transaksi SJ belum diisi.", 350, "#dialog-warning");
    //             throw new Error("VALIDATION_STOP");
    //         } else if (!noDok) {
    //             showErrorPopup("Nomor SJ belum diisi.", 350, "#dialog-warning");
    //             throw new Error("VALIDATION_STOP");
    //         } else if (!kodeGudang) {
    //             showErrorPopup("Gudang belum diisi.", 350, "#dialog-warning");
    //             throw new Error("VALIDATION_STOP");
    //         } else if (!expedisiVia) {
    //             showErrorPopup("Via Pengiriman belum diisi.", 350, "#dialog-warning");
    //             throw new Error("VALIDATION_STOP");
    //         } else if (!nopol) {
    //             showErrorPopup("No. Kendaraan belum diisi", 350, "#dialog-warning");
    //             throw new Error("VALIDATION_STOP");
    //         } else if (!pengemudi) {
    //             showErrorPopup("Pengemudi belum diisi", 350, "#dialog-warning");
    //             throw new Error("VALIDATION_STOP");
    //         } else if (selisih !== 0) {
    //             showErrorPopup("Terdapat nilai selisih antara Debit dan Kredit", 350, "#dialog-warning");
    //             throw new Error("VALIDATION_STOP");
    //         }
    //         dataDetail.nodes.forEach((node: any) => {
    //             if (node.no_do === "" || node.no_do === null) {
    //                 showErrorPopup("Data barang belum diisi", 350, "#dialog-warning");
    //                 throw new Error("VALIDATION_STOP");
    //             }
    //         });

    //         //  ==========CEK STOK==========
    //         let successCount = 0;
    //         let totalDetail = dataDetail.nodes.length;
    //         let cekOverQtyAll = false;
    //         let promises = dataDetail.nodes.map(async (item: any) => {
    //             // console.log(kode_entitas, kodeGudang, item.kode_item, moment().format('YYYY-MM-DD'), item.kode_do, item.qty, 'spm');
    //             return overQTYAll(
    //                 kode_entitas,
    //                 kodeGudang,
    //                 item.kode_item,
    //                 moment().format("YYYY-MM-DD HH:mm:ss"),
    //                 item.kode_do,
    //                 item.qty,
    //                 "sj",
    //                 "Kuantitas Standar SJ",
    //                 "#dialog-warning"
    //             )
    //                 .then((result) => {
    //                     if (result === true) {
    //                         // noting
    //                     } else {
    //                         successCount++;
    //                         if (successCount === totalDetail) {
    //                             cekOverQtyAll = true;
    //                         }
    //                     }
    //                 })
    //                 .catch((error) => {
    //                     if (error === "exit") {
    //                         //exit
    //                     } else {
    //                         // console.log(error);
    //                     }
    //                 });
    //         });
    //         //  ==========END CEK STOK==========

    //         Promise.all(promises)
    //             .then(async () => {
    //                 if (cekOverQtyAll) {
    //                     // console.log(dataDetail);
    //                     const modifieDataDetailAwal = dataDetail.nodes.map((node: any) => {
    //                         // console.log(diskonDok);
    //                         let totNilaiPajak = 0;
    //                         let qtysStd =
    //                             typeof node.qty_std === "string" && node.qty_std.includes(",") ? parseFloat(tanpaKoma(node.qty_std)) : node.qty_std;
    //                         let harga_mu =
    //                             typeof node.harga_mu === "string" && node.harga_mu.includes(",")
    //                                 ? parseFloat(tanpaKoma(node.harga_mu))
    //                                 : node.harga_mu;
    //                         let diskon_mu =
    //                             typeof node.diskon_mu === "string" && node.diskon_mu.includes(",")
    //                                 ? parseFloat(tanpaKoma(node.diskon_mu))
    //                                 : node.diskon_mu;
    //                         let potongan_mu =
    //                             typeof node.potongan_mu === "string" && node.potongan_mu.includes(",")
    //                                 ? parseFloat(tanpaKoma(node.potongan_mu))
    //                                 : node.potongan_mu;
    //                         let diskonDok3: any =
    //                             typeof diskonDok === "string" && diskonDok.includes(",") ? parseFloat(tanpaKoma(diskonDok)) : diskonDok;

    //                         // const jumlah = qtysStd * (parseFloat(node.harga_mu) - parseFloat(node.diskon_mu) - parseFloat(node.potongan_mu));
    //                         const jumlah = qtysStd * (harga_mu - diskon_mu - potongan_mu);
    //                         const jumlah_mu_diskon = (jumlah * diskonDok3) / 100;
    //                         // console.log(jumlah);

    //                         if (node.include === "N") {
    //                             totNilaiPajak = 0;
    //                         } else if (node.include === "E") {
    //                             let pajak =
    //                                 typeof node.pajak === "string" && node.pajak.includes(",") ? parseFloat(tanpaKoma(node.pajak)) : node.pajak;
    //                             totNilaiPajak = ((jumlah - jumlah_mu_diskon) * pajak) / 100;
    //                         } else if (node.include === "I") {
    //                             if (parseFloat(node.pajak) === 10) {
    //                                 totNilaiPajak = ((jumlah - jumlah_mu_diskon) / 1.1) * 0.1;
    //                             } else if (parseFloat(node.pajak) === 11) {
    //                                 totNilaiPajak = ((jumlah - jumlah_mu_diskon) / 1.11) * 0.11;
    //                             } else {
    //                                 totNilaiPajak = 0;
    //                             }
    //                         }

    //                         return {
    //                             ...node,
    //                             jumlah_mu: jumlah,
    //                             jumlah_rp: jumlah,
    //                             pajak_mu: totNilaiPajak, // node.include === 'E' ? totNilaiPajak : 0,
    //                         };
    //                     });
    //                     // console.log(modifieDataDetailAwal);
    //                     const dTotalRpFromDetail = modifieDataDetailAwal.reduce((total: any, detailItem: any) => {
    //                         // console.log(detailItem.jumlah_rp);
    //                         let jumlah_rp =
    //                             typeof detailItem.jumlah_rp === "string" && detailItem.jumlah_rp.includes(",")
    //                                 ? parseFloat(tanpaKoma(detailItem.jumlah_rp))
    //                                 : detailItem.jumlah_rp;
    //                         return total + jumlah_rp;
    //                     }, 0);

    //                     const dTotalDiskonRP = modifieDataDetailAwal.reduce((total: any, detailItem: any) => {
    //                         let qty =
    //                             typeof detailItem.qty === "string" && detailItem.qty.includes(",")
    //                                 ? parseFloat(tanpaKoma(detailItem.qty))
    //                                 : detailItem.qty;
    //                         return total + qty * (parseFloat(tanpaKoma(detailItem.diskon_mu)) * parseFloat(tanpaKoma(detailItem.kurs)));
    //                     }, 0);

    //                     const dTotalPotonganRP = modifieDataDetailAwal.reduce((total: any, detailItem: any) => {
    //                         let potongan_mu =
    //                             typeof detailItem.potongan_mu === "string" && detailItem.potongan_mu.includes(",")
    //                                 ? parseFloat(tanpaKoma(detailItem.potongan_mu))
    //                                 : detailItem.potongan_mu;
    //                         return total + potongan_mu;
    //                     }, 0);

    //                     const dTotalPajakRP = modifieDataDetailAwal.reduce((total: any, detailItem: any) => {
    //                         let kurs_pajak =
    //                             typeof detailItem.kurs_pajak === "string" && detailItem.kurs_pajak.includes(",")
    //                                 ? parseFloat(tanpaKoma(detailItem.kurs_pajak))
    //                                 : detailItem.kurs_pajak;
    //                         let pajak_mu =
    //                             typeof detailItem.pajak_mu === "string" && detailItem.pajak_mu.includes(",")
    //                                 ? parseFloat(tanpaKoma(detailItem.pajak_mu))
    //                                 : detailItem.pajak_mu;
    //                         return total + pajak_mu * kurs_pajak;
    //                     }, 0);

    //                     let diskonDok2: any = typeof diskonDok === "string" && diskonDok.includes(",") ? parseFloat(tanpaKoma(diskonDok)) : diskonDok;
    //                     const diskonDokRP = dTotalRpFromDetail * (diskonDok2 / 100);

    //                     const ctotalBeratHeader = modifieDataDetailAwal.reduce((total: any, detailItem: any) => {
    //                         let qty =
    //                             typeof detailItem.qty === "string" && detailItem.qty.includes(",")
    //                                 ? parseFloat(tanpaKoma(detailItem.qty))
    //                                 : detailItem.qty;
    //                         let berat =
    //                             typeof detailItem.berat === "string" && detailItem.berat.includes(",")
    //                                 ? parseFloat(tanpaKoma(detailItem.berat))
    //                                 : detailItem.berat;
    //                         return total + berat * qty;
    //                     }, 0);
    //                     // console.log('ctotalBeratHeader', ctotalBeratHeader);
    //                     setTotalBeratHeader(ctotalBeratHeader);
    //                     let totalNettoRP;
    //                     let totalPajak;
    //                     let kirim;
    //                     const detailDokumen: any = modifieDataDetailAwal[0];
    //                     // console.log(detailDokumen);
    //                     const CdataJurnal: any = dataJurnal.nodes[0];

    //                     // ================ JURNAL ==========================================
    //                     if (detailDokumen.include === "N") {
    //                         totalNettoRP = dTotalRpFromDetail; //+ dTotalPajakRP;
    //                     } else if (detailDokumen.include === "I") {
    //                         let IncludeDPP = dTotalRpFromDetail + dTotalPajakRP;
    //                         totalPajak = dTotalPajakRP;
    //                         totalNettoRP = IncludeDPP;
    //                     } else if (detailDokumen.include === "E") {
    //                         let diskonDok4: any =
    //                             typeof diskonDok === "string" && diskonDok.includes(",") ? parseFloat(tanpaKoma(diskonDok)) : diskonDok;
    //                         if (diskonDok4 > 0) {
    //                             totalPajak = dTotalPajakRP;
    //                             totalNettoRP = dTotalRpFromDetail + totalPajak;
    //                             // totalNettoRP = totalRpFromDetail - diskonDokRP + totalPajak + parseFloat(kirimMU);
    //                             // kirim = (parseFloat(kirimMU) / totalNettoRP) * 100;
    //                         } else {
    //                             totalPajak = dTotalPajakRP;
    //                             totalNettoRP = dTotalRpFromDetail;
    //                             //  kirim = (parseFloat(kirimMU) / totalNettoRP) * 100;
    //                         }
    //                     }

    //                     let modifiedDataJurnal;
    //                     try {
    //                         const autoJurnal = await autojurnal();
    //                         const updateJurnalEdit = { nodes: autoJurnal ?? [] };
    //                         // console.log(updateJurnalEdit);
    //                         modifiedDataJurnal = {
    //                             ...updateJurnalEdit,
    //                             nodes: updateJurnalEdit.nodes.map((node: any) => ({
    //                                 ...node,
    //                                 debet_rp: node.debet_rp,
    //                                 kredit_rp: node.kredit_rp,
    //                                 jumlah_mu: node.jumlah_mu,
    //                                 jumlah_rp: node.jumlah_rp,
    //                             })),
    //                         };
    //                         // console.log(modifiedDataJurnal);
    //                     } catch (error) {
    //                         showErrorPopup("Gagal generate jurnal otomatis", 350, "#dialog-warning");
    //                         return;
    //                     }

    //                     let modifikasiDetail: any;
    //                     let nilaiHpp: any;
    //                     try {
    //                         if (tipeSupp !== "cabang") {
    //                             let hppArray: any[] = [];

    //                             const promises = modifieDataDetailAwal.map(async (node: any) => {
    //                                 // console.log(moment(tglDokumen).format('YYYY-MM-DD HH:mm:ss'));
    //                                 const vTglDokSj = moment(tglDokumen).format("YYYY-MM-DD HH:mm:ss");
    //                                 // console.log(vTglDokSj);
    //                                 const responseHppSj = await GETHppSj(`param1=${node.kode_item}&param2=${vTglDokSj}&param3=${kodeGudang}`);

    //                                 nilaiHpp = responseHppSj.hpp;
    //                                 hppArray.push(nilaiHpp);
    //                                 // return nilaiHpp;
    //                             });
    //                             await Promise.all(promises).then(async () => {
    //                                 const reverseHppArray = hppArray;
    //                                 modifikasiDetail = {
    //                                     nodes: modifieDataDetailAwal.map((data: any, index: number) => ({
    //                                         ...data,
    //                                         hpp: reverseHppArray[index],
    //                                         // hpp2: index,
    //                                     })),
    //                                 };
    //                                 // console.log('modifikasiDetail', modifikasiDetail);
    //                             });
    //                         } else {
    //                             // console.log(modifieDataDetailAwal);
    //                             let hppArray: any[] = [];

    //                             const promises = modifieDataDetailAwal.map(async (node: any) => {
    //                                 const responseData: any = modifieDataDetailAwal;

    //                                 let nilaiHpp = parseFloat(responseData[0].jumlah_mu) / responseData[0].qty_std;
    //                                 hppArray.push(nilaiHpp);
    //                                 // return nilaiHpp;
    //                             });

    //                             await Promise.all(promises).then(async () => {
    //                                 const reverseHppArray = hppArray;

    //                                 modifikasiDetail = {
    //                                     nodes: modifieDataDetailAwal.map((data: any, index: number) => ({
    //                                         ...data,
    //                                         hpp: reverseHppArray[index],
    //                                     })),
    //                                 };
    //                             });
    //                         }
    //                     } catch (error) {
    //                         console.error("Error fetching data:", error);
    //                         throw error;
    //                     }

    //                     let isnullHPP = false;
    //                     let isSkipPersediaan = false;
    //                     try {
    //                         let Lskip_persediaan;
    //                         const resPreferensi = await GETPreferensi();
    //                         Lskip_persediaan =
    //                             resPreferensi[0].skip_persediaan === "" || resPreferensi[0].skip_persediaan === null
    //                                 ? ""
    //                                 : resPreferensi[0].skip_persediaan;

    //                         if (Lskip_persediaan === "Y") {
    //                             isSkipPersediaan = true;
    //                             // throw new Error("VALIDATION_STOP");
    //                         } else {
    //                             modifikasiDetail.nodes.forEach((node: any) => {
    //                                 if (node.hpp <= 0) {
    //                                     isnullHPP = true;
    //                                     // throw new Error("VALIDATION_STOP");
    //                                 }
    //                             });
    //                             // isSkipPersediaan = false;
    //                         }
    //                     } catch (error) {
    //                         console.error("Error fetching data:", error);
    //                         throw error;
    //                     }

    //                     if (!isnullHPP || isSkipPersediaan) {
    //                         let noDokSj =
    //                             jenis === "edit"
    //                                 ? noDok
    //                                 : await generateNUDivisi(
    //                                       kode_entitas,
    //                                       "",
    //                                       kodeDivisiJual,
    //                                       "12",
    //                                       tglDokumen.format("YYYYMM"),
    //                                       tglDokumen.format("YYMM") + `${kodeDivisiJual}`
    //                                   );
    //                         const modifiedData = {
    //                             entitas: kode_entitas,
    //                             kode_sj: kodeDok,
    //                             no_sj: noDokSj,

    //                             tgl_sj: moment(tglDokumen).format("YYYY-MM-DD HH:mm:ss"),
    //                             no_reff: "",
    //                             kode_gudang: kodeGudang,
    //                             kode_cust: selectedKodeCust,
    //                             alamat_kirim: alamatKirim,
    //                             via: expedisiVia,
    //                             fob: fob,
    //                             pengemudi: pengemudi,
    //                             nopol: nopol,
    //                             total_rp: dTotalRpFromDetail,
    //                             total_diskon_rp: dTotalDiskonRP + dTotalPotonganRP,
    //                             total_pajak_rp: dTotalPajakRP,
    //                             netto_rp: totalNettoRP,
    //                             total_berat: totalBeratHeader,
    //                             keterangan: catatan,
    //                             status: statusDok,
    //                             userid: userid,
    //                             tgl_update: currentDateTime,
    //                             dokumen: null,
    //                             kode_jual: kodeDivisiJual,
    //                             kirim: "N",
    //                             nota: null,
    //                             fdo: null,
    //                             tgl_trxsj: moment(tglTrx).format("YYYY-MM-DD HH:mm:ss"),
    //                             cetak_tunai: cetakTunai,

    //                             // detail: dataDetail.nodes.map((data: any, index) => ({
    //                             detail: modifikasiDetail.nodes.map((data: any, index: any) => ({
    //                                 ...data,
    //                                 kode_sj: kodeDok,
    //                                 qty: typeof data.qty === "string" && data.qty.includes(",") ? parseFloat(tanpaKoma(data.qty)) : data.qty,
    //                                 qty_std:
    //                                     typeof data.qty_std === "string" && data.qty_std.includes(",")
    //                                         ? parseFloat(tanpaKoma(data.qty_std))
    //                                         : data.qty_std,
    //                                 qty_sisa:
    //                                     typeof data.qty_sisa === "string" && data.qty_sisa.includes(",")
    //                                         ? parseFloat(tanpaKoma(data.qty_sisa))
    //                                         : data.qty_sisa,
    //                                 qty_retur: 0,
    //                                 // jumlah_mu: data.jumlah_mu.includes(',') ? parseFloat(tanpaKoma(data.jumlah_mu)) : parseFloat(data.jumlah_mu),
    //                                 // jumlah_rp: data.jumlah_rp.includes(',') ? parseFloat(tanpaKoma(data.jumlah_rp)) : parseFloat(data.jumlah_rp),
    //                             })),

    //                             jurnal: modifiedDataJurnal.nodes.map((data: any) => ({
    //                                 ...data,
    //                                 kode_dokumen: kodeDok,
    //                                 tgl_update: moment().format("YYYY-MM-DD HH:mm:ss"),
    //                                 tgl_dokumen: moment().format("YYYY-MM-DD HH:mm:ss"),
    //                                 tgl_valuta: null,
    //                                 tgl_rekonsil: null,
    //                                 no_warkat: null,
    //                                 kode_kerja: null,
    //                                 audit: null,
    //                                 kode_kry: null,
    //                                 kode_jual: null,
    //                                 no_kontrak_um: null,
    //                                 kredit_rp: parseFloat(tanpaKoma(data.kredit_rp)),
    //                                 debet_rp: parseFloat(tanpaKoma(data.debet_rp)),
    //                                 jumlah_rp: parseFloat(tanpaKoma(data.jumlah_rp)),
    //                                 jumlah_mu: parseFloat(tanpaKoma(data.jumlah_mu)),
    //                             })),
    //                         };

    //                         let vNilaiHpp = modifiedData.detail.reduce((total: any, detailItem: any) => {
    //                             return total + parseFloat(detailItem.hpp);
    //                         }, 0);

    //                         let vTotalRp = modifiedData.detail.reduce((total: any, detailItem: any) => {
    //                             return total + parseFloat(detailItem.jumlah_rp);
    //                         }, 0);

    //                         let vQtyStd = modifiedData.detail[0].qty_std;
    //                         let vTotalHpp = vNilaiHpp * vQtyStd;
    //                         // console.log('modifiedData base ', modifiedData);

    //                         const modifiedData3 = {
    //                             ...modifiedData,
    //                             jurnal: modifiedData.jurnal,
    //                         };
    //                         // console.log(modifiedData.jurnal);

    //                         try {
    //                             if (jenis === "edit") {
    //                                 // console.log('modifiedData3 EDIT ', modifiedData3);
    //                                 if (tagSaveDocRef.current !== "0") {
    //                                     try {
    //                                         const responseUpdate = await PATCHUpdateSj(modifiedData3);
    //                                         const payloadAudit: IPayloadSimpanAudit = {
    //                                             kode_audit: null,
    //                                             dokumen: "SJ",
    //                                             kode_dokumen: responseUpdate.kode_sj,
    //                                             no_dokumen: responseUpdate.no_sj,
    //                                             tanggal: moment().format("YYYY-MM-DD HH:mm:ss"),
    //                                             proses: "EDIT",
    //                                             diskripsi: `SJ item = ${dataDetail.nodes.length} nilai transaksi ${modifiedData3.netto_rp}`,
    //                                             userid: userid, // userid login web
    //                                             system_user: "", //username login
    //                                             system_ip: "", //ip address
    //                                             system_mac: "", //mac address
    //                                         };
    //                                         const resss = await POSTSimpanAudit(payloadAudit);
    //                                         // await generateNU(kode_entitas, noPB, '12', dateTglDokumen.format('YYYYMM'));
    //                                         setIsLoadingModal(100);
    //                                         setShowLoadingModal(false);
    //                                         Swal.fire({
    //                                             title: "Berhasil simpan perubahan SJ",
    //                                             icon: "success",
    //                                             target: "#dialog-warning",
    //                                         }).then(() => {
    //                                             onClose();
    //                                         });
    //                                     } catch (error) {
    //                                         showErrorPopup("Gagal menyimpan perubahan SJ" + error, 350, "#dialog-warning");
    //                                     }
    //                                 }
    //                             } else {
    //                                 // console.log('modifiedData3 POST ', modifiedData3);
    //                                 // cekSubledgerById('AK0000000154');
    //                                 if (tagSaveDocRef.current !== "0") {
    //                                     const responseSimpan = await POSTSimpanSj(modifiedData3);
    //                                     const payloadAudit: IPayloadSimpanAudit = {
    //                                         kode_audit: null,
    //                                         dokumen: "SJ",
    //                                         kode_dokumen: responseSimpan.kode_sj,
    //                                         no_dokumen: responseSimpan.no_sj,
    //                                         tanggal: moment().format("YYYY-MM-DD HH:mm:ss"),
    //                                         proses: "NEW",
    //                                         diskripsi: `SJ item = ${dataDetail.nodes.length} total berat =  ${modifiedData3.total_berat} nilai transaksi ${modifiedData3.netto_rp}`,
    //                                         userid: userid, // userid login web
    //                                         system_user: "", //username login
    //                                         system_ip: "", //ip address
    //                                         system_mac: "", //mac address
    //                                     };
    //                                     const resss = await POSTSimpanAudit(payloadAudit);
    //                                     await generateNUDivisi(
    //                                         kode_entitas,
    //                                         noDokSj,
    //                                         kodeDivisiJual,
    //                                         "12",
    //                                         moment(tglDokumen).format("YYYYMM"),
    //                                         moment(tglDokumen).format("YYMM") + `${kodeDivisiJual}`
    //                                     );
    //                                     // await generateNU(kode_entitas, noDok, '12', tglDokumen.format('YYYYMM'));
    //                                     setIsLoadingModal(100);
    //                                     setShowLoadingModal(false);
    //                                     Swal.fire({
    //                                         title: "Berhasil simpan SJ",
    //                                         icon: "success",
    //                                         target: "#dialog-warning",
    //                                     }).then(() => {
    //                                         onClose();
    //                                     });
    //                                 }
    //                             }
    //                         } catch (error) {
    //                             showErrorPopup("Gagal menyimpan SJ. Silakan coba lagi." + error, 350, "#dialog-warning");
    //                         }
    //                     } else {
    //                         if (isnullHPP) {
    //                             modifikasiDetail.nodes.map((node: any) => {
    //                                 showErrorPopup(
    //                                     "HPP untuk item " + node.diskripsi + " tidak dapat di hitung, data tidak dapat disimpan.",
    //                                     350,
    //                                     "#dialog-warning"
    //                                 );
    //                                 // console.log('GK NGESAVE');
    //                             });
    //                         }
    //                     }
    //                 }
    //             })
    //             .catch((error) => {
    //                 showErrorPopup("Gagal menyimpan SJ. Silakan coba lagi." + error, 350, "#dialog-warning");
    //             });
    //     } catch (err: any) {
    //         if (err.message === "VALIDATION_STOP") return;
    //         // setShowLoadingModal(false);
    //         console.error("Error during save", err);
    //     }
    // };
    // //================================OLD END SAVE DOC=============================================//

    //================================NEW START SAVE DOC=============================================//
    class ValidationError extends Error {
        constructor(message: string) {
            super(message);
            this.name = "ValidationError";
        }
    }

    // ============================================================
    // HELPER: Validasi semua field wajib & kondisi bisnis
    // ============================================================
    async function validateBeforeSave(params: {
        selectedKodeSj: string;
        kode_user: string;
        tglDokumen: any;
        tglTrx: any;
        periode: any;
        dataDetail: any;
        noDok: string;
        kodeGudang: string;
        expedisiVia: string;
        nopol: string;
        pengemudi: string;
        selisih: number;
        statusDok: string;
        kode_entitas: string;
        diskonDok: any;
        showErrorPopup: Function;
    }) {
        const {
            selectedKodeSj,
            kode_user,
            tglDokumen,
            tglTrx,
            periode,
            dataDetail,
            noDok,
            kodeGudang,
            expedisiVia,
            nopol,
            pengemudi,
            selisih,
            statusDok,
            kode_entitas,
            diskonDok,
            showErrorPopup,
        } = params;

        // 1. Cek status dokumen & akses user
        const [responseStatusPakai, responseUsersAkses] = await Promise.all([
            GETStatusIsPakai(`param1=${selectedKodeSj}`),
            GETUsersAkses(`param1=${kode_user}`),
        ]);
        const LisPakai: boolean = responseStatusPakai[0].isPakai;
        const LApp: string = responseUsersAkses[0].app_backdate;

        if (LisPakai !== true) {
            showErrorPopup(`Status Dokumen ${statusDok}, Tidak Dapat Disimpan Kembali`, 350, "#dialog-warning");
            throw new ValidationError("STATUS_PAKAI");
        }

        // 2. Cek tanggal dokumen vs periode
        if (tglDokumen < periode) {
            showErrorPopup(
                "Tanggal transaksi yang anda masukan lebih kecil dari periode yang dijalankan, data tidak dapat di simpan",
                400,
                "#dialog-warning"
            );
            throw new ValidationError("TGL_VS_PERIODE");
        }

        // 3. Cek tanggal dokumen vs tanggal referensi (DO)
        for (const node of dataDetail.nodes) {
            const vtglDok = moment(tglDokumen, "DD-MM-YYYY HH:mm:ss");
            const vtglDo = moment(node.tgl_do, "DD-MM-YYYY HH:mm:ss");

            if (vtglDok.isAfter(vtglDo)) {
                showErrorPopup(
                    `Tanggal transaksi yang direferensi (${node.tgl_do}) lebih kecil dari tanggal dokumen (${vtglDok.format(
                        "DD-MM-YYYY HH:mm:ss"
                    )}), data tidak bisa disimpan.`,
                    400,
                    "#dialog-warning"
                );
                throw new ValidationError("DATE_FAKE");
            }
        }

        // 4. Validasi future date (khusus entitas pajak, bukan admin, bukan backdate)
        const resEntitasPajak = await GETEntitasPajak(`param1=${kode_user}`);
        const isPajak = resEntitasPajak.some((item: any) => item.kodecabang === kode_entitas && item.pajak === "Y");
        const isAdmin = ["Admin", "ADMIN", "admin"].includes(kode_user);
        const tanggalApp = moment().format("YYYY-MM-DD");

        if (isPajak && !isAdmin && LApp !== "Y" && tglTrx > tanggalApp) {
            const AppDate = new Date();
            if (DaysBetween(AppDate, tglTrx) > 2) {
                showErrorPopup("Tanggal kirim future date lebih besar dari 3 hari.", 350, "#dialog-warning");
                throw new ValidationError("FUTURE_DATE_3");
            }
            if (DaysBetween(tglTrx, AppDate) > 14) {
                showErrorPopup("Tanggal kirim future date lebih besar dari 14 hari.", 350, "#dialog-warning");
                throw new ValidationError("FUTURE_DATE_14");
            }
        }

        // 5. Cek qty & no_do tidak kosong
        for (const node of dataDetail.nodes) {
            if (node.qty === 0) {
                showErrorPopup("Masih ada Kuantitas yang 0 atau harga yang 0", 350, "#dialog-warning");
                throw new ValidationError("QTY_KOSONG");
            }
            if (!node.no_do) {
                showErrorPopup("Data barang belum diisi", 350, "#dialog-warning");
                throw new ValidationError("NO_DO_KOSONG");
            }
        }

        // 6. Validasi field header
        const fieldValidations = [
            [!kodeDivisiJual, "Divisi Penjualan belum diisi."],
            [!tglDokumen, "Tanggal SJ belum diisi."],
            [!tglTrx, "Tanggal Transaksi SJ belum diisi."],
            [!noDok, "Nomor SJ belum diisi."],
            [!kodeGudang, "Gudang belum diisi."],
            [!expedisiVia, "Via Pengiriman belum diisi."],
            [!nopol, "No. Kendaraan belum diisi."],
            [!pengemudi, "Pengemudi belum diisi."],
            [selisih !== 0, "Terdapat nilai selisih antara Debit dan Kredit."],
        ] as [boolean, string][];

        for (const [condition, message] of fieldValidations) {
            if (condition) {
                showErrorPopup(message, 350, "#dialog-warning");
                throw new ValidationError("FIELD_KOSONG");
            }
        }

        return { LApp }; // nilai yang dibutuhkan tahap selanjutnya
    }

    // ============================================================
    // HELPER: Konversi nilai apapun (string/number/null) ke number
    // Menggantikan pola: typeof x === "string" && x.includes(",") ? parseFloat(tanpaKoma(x)) : x
    // ============================================================
    function toNum(val: any): number {
        if (val === null || val === undefined || val === "") return 0;
        if (typeof val === "number") return isNaN(val) ? 0 : val;
        if (typeof val === "string") return parseFloat(tanpaKoma(val)) || 0;
        return 0;
    }

    // ============================================================
    // HELPER: Hitung ulang nilai detail (jumlah, pajak, dll)
    // ============================================================
    function buildDetailWithCalculation(dataDetail: any, diskonDok: any) {
        const diskonDokNum = toNum(diskonDok);

        return dataDetail.nodes.map((node: any) => {
            const qtysStd = toNum(node.qty_std);
            const harga_mu = toNum(node.harga_mu);
            const diskon_mu = toNum(node.diskon_mu);
            const potongan = toNum(node.potongan_mu);
            const pajak = toNum(node.pajak);

            const jumlah = qtysStd * (harga_mu - diskon_mu - potongan);
            const jumlah_diskon = (jumlah * diskonDokNum) / 100;

            let totNilaiPajak = 0;
            if (node.include === "E") {
                totNilaiPajak = ((jumlah - jumlah_diskon) * pajak) / 100;
            } else if (node.include === "I") {
                if (pajak === 10) totNilaiPajak = ((jumlah - jumlah_diskon) / 1.1) * 0.1;
                else if (pajak === 11) totNilaiPajak = ((jumlah - jumlah_diskon) / 1.11) * 0.11;
            }

            return { ...node, jumlah_mu: jumlah, jumlah_rp: jumlah, pajak_mu: totNilaiPajak };
        });
    }

    // ============================================================
    // HELPER: Hitung summary total dari detail
    // ============================================================
    function buildTotals(detailNodes: any[], diskonDok: any) {
        const n = toNum;
        const diskonDokNum = toNum(diskonDok);

        const totalRp = detailNodes.reduce((s, d) => s + n(d.jumlah_rp), 0);
        const totalDiskon = detailNodes.reduce((s, d) => s + n(d.qty) * (n(d.diskon_mu) * n(d.kurs)), 0);
        const totalPotongan = detailNodes.reduce((s, d) => s + n(d.potongan_mu), 0);
        const totalPajak = detailNodes.reduce((s, d) => s + n(d.pajak_mu) * n(d.kurs_pajak), 0);
        const totalBerat = detailNodes.reduce((s, d) => s + n(d.berat) * n(d.qty), 0);
        const diskonDokRp = totalRp * (diskonDokNum / 100);

        const include = detailNodes[0]?.include;
        let totalNetto = totalRp;
        if (include === "I") totalNetto = totalRp + totalPajak;
        else if (include === "E") totalNetto = diskonDokNum > 0 ? totalRp + totalPajak : totalRp;

        return { totalRp, totalDiskon, totalPotongan, totalPajak, totalBerat, diskonDokRp, totalNetto };
    }

    // ============================================================
    // HELPER: Ambil HPP per item dari API
    // ============================================================
    async function fetchHppForDetail(detailNodes: any[], tglDokumen: any, kodeGudang: string, tipeSupp: string) {
        if (tipeSupp === "cabang") {
            // HPP dihitung dari data sendiri (bukan API)
            return detailNodes.map((node: any) => ({
                ...node,
                hpp: toNum(node.jumlah_mu) / node.qty_std,
            }));
        }

        const tglFmt = moment(tglDokumen).format("YYYY-MM-DD HH:mm:ss");

        const hppResults = await Promise.all(
            detailNodes.map((node: any) => GETHppSj(`param1=${node.kode_item}&param2=${tglFmt}&param3=${kodeGudang}`).then((res: any) => res.hpp))
        );

        return detailNodes.map((node: any, i: number) => ({ ...node, hpp: hppResults[i] }));
    }

    // ============================================================
    // MAIN: saveDoc
    // ============================================================
    const saveDoc = async () => {
        // Reset loading state
        setShowLoadingModal(true);
        setIsLoadingModal(5);
        setCurrentIndicator("Memulai proses simpan...");

        try {
            // ── TAHAP 1: Validasi (semua validasi dalam satu blok) ──────────
            setIsLoadingModal(10);
            setCurrentIndicator("Validasi dokumen...");

            await validateBeforeSave({
                selectedKodeSj,
                kode_user,
                tglDokumen,
                tglTrx,
                periode,
                dataDetail,
                noDok,
                kodeGudang,
                expedisiVia,
                nopol,
                pengemudi,
                selisih,
                statusDok,
                kode_entitas,
                diskonDok,
                showErrorPopup,
            });

            // ── TAHAP 2: Reset tanggal jika berubah ────────────────────────
            if (tglDokumenOrigin !== tglDokumen) {
                setIsLoadingModal(20);
                setCurrentIndicator("Reset tanggal dokumen...");
                const [newTglDok, newTglTrx] = await Promise.all([ResetTime(kode_entitas, undefined), ResetTime(kode_entitas, undefined)]);
                setTglDokumen(newTglDok);
                setTglTrx(newTglTrx);
            }

            // ── TAHAP 3: Hitung detail & totals ────────────────────────────
            setIsLoadingModal(30);
            setCurrentIndicator("Menghitung nilai transaksi...");

            const detailCalculated = buildDetailWithCalculation(dataDetail, diskonDok);
            const totals = buildTotals(detailCalculated, diskonDok);
            setTotalBeratHeader(totals.totalBerat);

            // ── TAHAP 4: Cek stok (overQTY) ────────────────────────────────
            setIsLoadingModal(40);
            setCurrentIndicator("Memeriksa ketersediaan stok...");

            const stockResults = await Promise.all(
                detailCalculated.map((item: any) =>
                    overQTYAll(
                        kode_entitas,
                        kodeGudang,
                        item.kode_item,
                        moment().format("YYYY-MM-DD HH:mm:ss"),
                        item.kode_do,
                        item.qty,
                        "sj",
                        "Kuantitas Standar SJ",
                        "#dialog-warning"
                    ).catch((err: any) => (err === "exit" ? "exit" : null))
                )
            );

            const allStockOk = stockResults.every((r) => r !== true && r !== "exit");
            if (!allStockOk) {
                // overQTYAll sudah menampilkan popup sendiri, cukup stop di sini
                setShowLoadingModal(false);
                return;
            }

            // ── TAHAP 5: Generate jurnal otomatis ──────────────────────────
            setIsLoadingModal(55);
            setCurrentIndicator("Generate jurnal otomatis...");

            let modifiedDataJurnal: any;
            try {
                const autoJurnal = await autojurnal();
                modifiedDataJurnal = { nodes: autoJurnal ?? [] };
            } catch {
                showErrorPopup("Gagal generate jurnal otomatis.", 350, "#dialog-warning");
                return;
            }

            // ── TAHAP 6: Ambil HPP ─────────────────────────────────────────
            setIsLoadingModal(65);
            setCurrentIndicator("Mengambil data HPP...");

            const detailWithHpp = await fetchHppForDetail(detailCalculated, tglDokumen, kodeGudang, tipeSupp);

            // ── TAHAP 7: Cek preferensi skip_persediaan & validasi HPP ─────
            setIsLoadingModal(75);
            setCurrentIndicator("Validasi HPP & preferensi...");

            const resPreferensi = await GETPreferensi();
            const isSkipPersediaan = resPreferensi[0].skip_persediaan === "Y";

            if (!isSkipPersediaan) {
                const itemHppNol = detailWithHpp.find((n: any) => n.hpp <= 0);
                if (itemHppNol) {
                    showErrorPopup(
                        `HPP untuk item "${itemHppNol.diskripsi}" tidak dapat dihitung, data tidak dapat disimpan.`,
                        350,
                        "#dialog-warning"
                    );
                    return;
                }
            }

            // ── TAHAP 8: Susun payload final ───────────────────────────────
            setIsLoadingModal(85);
            setCurrentIndicator("Menyusun data...");

            const noDokSj =
                jenis === "edit"
                    ? noDok
                    : await generateNUDivisi(
                          kode_entitas,
                          "",
                          kodeDivisiJual,
                          "12",
                          tglDokumen.format("YYYYMM"),
                          tglDokumen.format("YYMM") + `${kodeDivisiJual}`
                      );

            const n = toNum;
            const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

            const payload = {
                entitas: kode_entitas,
                kode_sj: kodeDok,
                no_sj: noDokSj,
                tgl_sj: moment(tglDokumen).format("YYYY-MM-DD HH:mm:ss"),
                no_reff: "",
                kode_gudang: kodeGudang,
                kode_cust: selectedKodeCust,
                alamat_kirim: alamatKirim,
                via: expedisiVia,
                fob: fob,
                pengemudi: pengemudi,
                nopol: nopol,
                total_rp: totals.totalRp,
                total_diskon_rp: totals.totalDiskon + totals.totalPotongan,
                total_pajak_rp: totals.totalPajak,
                netto_rp: totals.totalNetto,
                total_berat: totals.totalBerat,
                keterangan: catatan,
                status: statusDok,
                userid: userid,
                tgl_update: currentDateTime,
                dokumen: null,
                kode_jual: kodeDivisiJual,
                kirim: "N",
                nota: null,
                fdo: null,
                tgl_trxsj: moment(tglTrx).format("YYYY-MM-DD HH:mm:ss"),
                cetak_tunai: cetakTunai,

                detail: detailWithHpp.map((data: any) => ({
                    ...data,
                    kode_sj: kodeDok,
                    qty: n(data.qty),
                    qty_std: n(data.qty_std),
                    qty_sisa: n(data.qty_sisa),
                    qty_retur: 0,
                })),

                jurnal: modifiedDataJurnal.nodes.map((data: any) => ({
                    ...data,
                    kode_dokumen: kodeDok,
                    tgl_update: currentDateTime,
                    tgl_dokumen: currentDateTime,
                    tgl_valuta: null,
                    tgl_rekonsil: null,
                    no_warkat: null,
                    kode_kerja: null,
                    audit: null,
                    kode_kry: null,
                    kode_jual: null,
                    no_kontrak_um: null,
                    kredit_rp: n(data.kredit_rp),
                    debet_rp: n(data.debet_rp),
                    jumlah_rp: n(data.jumlah_rp),
                    jumlah_mu: n(data.jumlah_mu),
                })),
            };

            // ── TAHAP 9: Simpan ke server ───────────────────────────────────
            setIsLoadingModal(90);
            setCurrentIndicator(jenis === "edit" ? "Menyimpan perubahan..." : "Menyimpan dokumen baru...");

            if (tagSaveDocRef.current === "0") return; // guard duplikat simpan

            if (jenis === "edit") {
                const responseUpdate = await PATCHUpdateSj(payload);
                await POSTSimpanAudit({
                    kode_audit: null,
                    dokumen: "SJ",
                    kode_dokumen: responseUpdate.kode_sj,
                    no_dokumen: responseUpdate.no_sj,
                    tanggal: currentDateTime,
                    proses: "EDIT",
                    diskripsi: `SJ item = ${dataDetail.nodes.length} total berat = ${payload.total_berat} nilai transaksi ${payload.netto_rp}`,
                    userid,
                    system_user: "",
                    system_ip: "",
                    system_mac: "",
                });
            } else {
                const responseSimpan = await POSTSimpanSj(payload);
                await POSTSimpanAudit({
                    kode_audit: null,
                    dokumen: "SJ",
                    kode_dokumen: responseSimpan.kode_sj,
                    no_dokumen: responseSimpan.no_sj,
                    tanggal: currentDateTime,
                    proses: "NEW",
                    diskripsi: `SJ item = ${dataDetail.nodes.length} total berat = ${payload.total_berat} nilai transaksi ${payload.netto_rp}`,
                    userid,
                    system_user: "",
                    system_ip: "",
                    system_mac: "",
                });
                await generateNUDivisi(
                    kode_entitas,
                    noDokSj,
                    kodeDivisiJual,
                    "12",
                    moment(tglDokumen).format("YYYYMM"),
                    moment(tglDokumen).format("YYMM") + `${kodeDivisiJual}`
                );
            }

            // ── SELESAI ─────────────────────────────────────────────────────
            setIsLoadingModal(100);
            setShowLoadingModal(false);

            const title = jenis === "edit" ? "Berhasil simpan perubahan SJ" : "Berhasil simpan SJ";
            await Swal.fire({ title, icon: "success", target: "#dialog-warning" });
            onClose();
        } catch (err: any) {
            setShowLoadingModal(false);

            // ValidationError tidak perlu di-log, sudah ditampilkan ke user
            if (err instanceof ValidationError) return;

            // Error tak terduga (network, server, dll)
            console.error("Unexpected error during saveDoc:", err);
            showErrorPopup("Gagal menyimpan SJ. Silakan coba lagi.\n" + err?.message, 350, "#dialog-warning");
        }
    };
    //================================NEW END SAVE DOC=============================================//

    const handleAutoJurnal = async () => {
        // cek apakah ada barang belum diisi
        const hasEmpty = dataDetail.nodes.some((node: any) => !node.no_do);

        if (hasEmpty) {
            showErrorPopup("Data barang belum diisi", 350, "#dialog-warning");
            return;
        }

        tagSaveDocRef.current = "0";
        await autojurnal();
    };

    const handleSaveDoc = async () => {
        tagSaveDocRef.current = "1";
        saveDoc();
    };

    const SimpanLeger = async (kodeCust: any) => {
        const responseGetNamaLedger = await GETGetNamaLedger(`param1=${kodeCust}`);
        // console.log(responseGetNamaLedger);
        return responseGetNamaLedger.map((item: any) => ({
            ...item,
            quJurnalnama_subledger: item.subledger,
        }));
    };

    let quJurnalkode_subledger: any, quJurnalnama_subledger: any;

    const cekSubledgerById = async (jurnalKodeAkun: any) => {
        try {
            const responseData = await GETCekSubledgerByAkunId(`param1=${jurnalKodeAkun}`);
            // console.log(responseData);
            if (responseData === true) {
                await SimpanLeger(selectedKodeCust).then((result) => {
                    // console.log('nilai true');
                    quJurnalkode_subledger = selectedKodeCust;
                    quJurnalnama_subledger = result[0].subledger;

                    // console.log(quJurnalkode_subledger);
                    // console.log(quJurnalnama_subledger);
                });
            } else {
                // console.log('nilai false');
                quJurnalkode_subledger = "";
                quJurnalnama_subledger = "";
            }
            // return responseData.map((item: any) => ({
            //     ...item,
            //     quJurnalnama_subledger: item.subledger,
            // }));
        } catch (error) {
            showErrorPopup("Gagal mengecek subledger: " + error, 350, "#dialog-warning");
        }
    };
    // cekSubledgerById('AK0000000154');

    const autojurnal = async () => {
        try {
            setDataJurnal({ nodes: [] });
            // setTombolSimpan(true);
            const fieldKosong = dataDetail.nodes.some((row: { diskripsi: string }) => row.diskripsi === "");
            const jurnalArray: any[] = [];

            // console.log("dataDetail:", dataDetail);
            // console.log("fieldKosong:", fieldKosong);
            // if (fieldKosong) {
            //     showErrorPopup("Data detail jurnal masih kosong", 350, "#dialog-warning");
            //     throw "exit";
            // }

            if (mTotalRp < 0) {
                showErrorPopup("Periksa kuantitas atau harga barang.", 350, "#dialog-warning");
                throw "exit";
            } else {
                const { nodes } = dataDetail;
                let totalDiskonMu = 0,
                    totalBerat = 0,
                    totpsd = 0,
                    kode_psd = "",
                    psd = 0,
                    pajak = 0,
                    kirim_mu = 0,
                    totHpp = 0;
                let modifikasiDetail: any;
                let nilaiHpp: any;
                let xxTotalHpp = 0;
                // Process nodes sequentially so totals and HPP fetches complete before continuing
                const processedNodes: any[] = [];
                for (const node of nodes) {
                    let pajak_mu =
                        typeof node.pajak_mu === "string" && node.pajak_mu.includes(",") ? parseFloat(tanpaKoma(node.pajak_mu)) : node.pajak_mu;
                    let kurs_pajak =
                        typeof node.kurs_pajak === "string" && node.kurs_pajak.includes(",")
                            ? parseFloat(tanpaKoma(node.kurs_pajak))
                            : node.kurs_pajak;
                    let jumlah_rp =
                        typeof node.jumlah_rp === "string" && node.jumlah_rp.includes(",") ? parseFloat(tanpaKoma(node.jumlah_rp)) : node.jumlah_rp;

                    pajak += pajak_mu * kurs_pajak;
                    if (node.include === "I") {
                        totpsd += jumlah_rp + pajak_mu * kurs_pajak;
                    } else {
                        totpsd += jumlah_rp;
                    }
                    if (node.kode_akun_persedian !== "") {
                        if (node.include === "I") {
                            psd += pajak_mu;
                        } else {
                            psd += jumlah_rp;
                        }
                    }

                    if (tipeSupp !== "cabang") {
                        const vTglDokSj = moment(tglDokumen).format("YYYY-MM-DD HH:mm:ss");
                        const responseData = await GETHppSj(`param1=${node.kode_item}&param2=${vTglDokSj}&param3=${kodeGudang}`);

                        let qtysStd =
                            typeof node.qty_std === "string" && node.qty_std.includes(",") ? parseFloat(tanpaKoma(node.qty_std)) : node.qty_std;
                        nilaiHpp = responseData.hpp;
                        totHpp += nilaiHpp * qtysStd;
                        xxTotalHpp += nilaiHpp * qtysStd;
                    }

                    processedNodes.push({ ...node });
                }

                let i = 1; // id_dokumen
                // hutang supplier
                // console.log("tipeSupp", tipeSupp);
                if (tipeSupp !== "cabang") {
                    let LkodeAkunHPP, LNoHPP, LNamaHPP, LTipeHPP;
                    const resPreferensi = await GETPreferensi();
                    LkodeAkunHPP =
                        resPreferensi[0].kode_akun_hpp === "" || resPreferensi[0].kode_akun_hpp === null ? "" : resPreferensi[0].kode_akun_hpp;
                    LNoHPP = resPreferensi[0].no_hpp === "" || resPreferensi[0].no_hpp === null ? "" : resPreferensi[0].no_hpp;
                    LNamaHPP = resPreferensi[0].nama_hpp === "" || resPreferensi[0].nama_hpp === null ? "" : resPreferensi[0].nama_hpp;
                    LTipeHPP = resPreferensi[0].tipe_hpp === "" || resPreferensi[0].tipe_hpp === null ? "" : resPreferensi[0].tipe_hpp;

                    // const id = dataJurnal.nodes.length + 1;
                    // quJurnalkode_subledger = selectedKodeCust;
                    // quJurnalnama_subledger = result[0].subledger;
                    await cekSubledgerById(LkodeAkunHPP);
                    // console.log(quJurnalkode_subledger);
                    // console.log(quJurnalnama_subledger);
                    const newNodeJurnal = {
                        kode_dokumen: "",
                        id_dokumen: i,
                        id: i,
                        dokumen: "SJ",
                        tgl_dokumen: "",
                        kode_akun: LkodeAkunHPP,
                        no_akun: LNoHPP,
                        nama_akun: LNamaHPP,
                        tipe: LTipeHPP,
                        kode_subledger: quJurnalkode_subledger ? quJurnalkode_subledger : null, // selectedKodeCust,
                        no_subledger: "", //noCust,
                        nama_subledger: quJurnalnama_subledger ? quJurnalnama_subledger : "", //namaRelasi,
                        kurs: 1.0,
                        kode_mu: "IDR",
                        debet_rp: frmNumber(xxTotalHpp), //frmNumber(totpsd + pajak),
                        kredit_rp: "0.00",
                        jumlah_rp: frmNumber(xxTotalHpp), //frmNumber(totpsd + pajak),
                        jumlah_mu: frmNumber(xxTotalHpp), //frmNumber(totpsd + pajak),
                        catatan: "Harga Pokok No. SJ:  " + noDok, //frmNumber(xxTotalHpp),
                        persen: 0,
                        kode_dept: kodeDept,
                        kode_kerja: "",
                        approval: "N",
                        posting: "N",
                        rekonsiliasi: "N",
                        tgl_rekonsil: "",
                        userid: userid,
                        tgl_update: "",
                        nama_dept: "",
                        nama_kerja: "",
                        isledger: "",
                        // subledger: noCust + '-' + namaRelasi,
                        subledger: "",
                        no_warkat: "",
                        tgl_valuta: "",
                        no_kerja: "",
                    };
                    // console.log('totpsd ' + totpsd);
                    // console.log('pajak ' + pajak);
                    setDataJurnal((state: any) => ({
                        ...state,
                        nodes: state.nodes.concat(newNodeJurnal),
                    }));
                    jurnalArray.push(newNodeJurnal);
                    i++;
                    // console.log('newNodeJurnal', newNodeJurnal.debet_rp);
                } else {
                    let LkodeAkunPenjualanCabang, LNoPenjualanCabang, LNamaPenjualanCabang, LTipeHutang;
                    const resPreferensi = await GETPreferensi();
                    LkodeAkunPenjualanCabang =
                        resPreferensi[0].kode_akun_penjualan_cabang === "" || resPreferensi[0].kode_akun_penjualan_cabang === null
                            ? ""
                            : resPreferensi[0].kode_akun_penjualan_cabang;
                    LNoPenjualanCabang =
                        resPreferensi[0].no_penjualan_cabang === "" || resPreferensi[0].no_penjualan_cabang === null
                            ? ""
                            : resPreferensi[0].no_penjualan_cabang;
                    LNamaPenjualanCabang =
                        resPreferensi[0].nama_penjualan_cabang === "" || resPreferensi[0].nama_penjualan_cabang === null
                            ? ""
                            : resPreferensi[0].nama_penjualan_cabang;

                    let quJurnalkode_subledger: any, quJurnalnama_subledger: any;

                    await SimpanLeger(selectedKodeCust).then((result) => {
                        quJurnalkode_subledger = selectedKodeCust;
                        quJurnalnama_subledger = result[0].subledger;
                    });
                    // const id = dataJurnal.nodes.length + 1;
                    await cekSubledgerById(LkodeAkunPenjualanCabang);
                    // console.log(quJurnalkode_subledger);
                    // console.log(quJurnalnama_subledger);
                    const newNodeJurnal = {
                        kode_dokumen: "",
                        id_dokumen: i,
                        id: i,
                        dokumen: "SJ",
                        tgl_dokumen: "",
                        kode_akun: LkodeAkunPenjualanCabang,
                        no_akun: LNoPenjualanCabang,
                        nama_akun: LNamaPenjualanCabang,
                        tipe: LTipeHutang,
                        kode_subledger: quJurnalkode_subledger ? quJurnalkode_subledger : null, //selectedKodeCust,
                        no_subledger: "", //noCust,
                        nama_subledger: quJurnalnama_subledger ? quJurnalnama_subledger : "", //selectedNamaCust,
                        kurs: 1.0,
                        kode_mu: "IDR",
                        debet_rp: frmNumber(totpsd), //frmNumber(totpsd + pajak),
                        kredit_rp: "0.00",
                        jumlah_rp: frmNumber(totpsd), //frmNumber(totpsd + pajak),
                        jumlah_mu: frmNumber(totpsd), //frmNumber(totpsd + pajak),
                        catatan: "Piutang Dlm Penyelesaian No. SJ:  " + noDok,
                        persen: 0,
                        kode_dept: kodeDept,
                        kode_kerja: "",
                        approval: "N",
                        posting: "N",
                        rekonsiliasi: "N",
                        tgl_rekonsil: "",
                        userid: userid,
                        tgl_update: "",
                        nama_dept: "",
                        nama_kerja: "",
                        isledger: "",
                        subledger: "",
                        no_warkat: "",
                        tgl_valuta: "",
                        no_kerja: "",
                    };
                    setDataJurnal((state: any) => ({
                        ...state,
                        nodes: state.nodes.concat(newNodeJurnal),
                    }));
                    jurnalArray.push(newNodeJurnal);
                    i++;
                }

                const resPreferensi = await GETPreferensi();
                let s_kode_psd =
                    resPreferensi[0].kode_akun_persediaan === "" || resPreferensi[0].kode_akun_persediaan === null
                        ? ""
                        : resPreferensi[0].kode_akun_persediaan;
                kode_psd = s_kode_psd;

                if (kode_psd !== "") {
                    const resAkunPersediaan = await GETAkunJurnalById(`param1=${kode_psd}&param2=all&param3=all`);
                    await cekSubledgerById(kode_psd);
                    // console.log(quJurnalkode_subledger);
                    // console.log(quJurnalnama_subledger);
                    const newNodeJurnal = {
                        kode_dokumen: "",
                        id_dokumen: i,
                        id: i,
                        dokumen: "SJ",
                        tgl_dokumen: "",
                        kode_akun: kode_psd,
                        no_akun: resAkunPersediaan[0].no_akun,
                        nama_akun: resAkunPersediaan[0].nama_akun,
                        tipe: resAkunPersediaan[0].tipe,
                        kode_subledger: quJurnalkode_subledger ? quJurnalkode_subledger : null, //null,
                        no_subledger: "",
                        nama_subledger: quJurnalkode_subledger ? quJurnalkode_subledger : "", //'',
                        kurs: 1.0,
                        kode_mu: "IDR",
                        debet_rp: "0.00", //psd
                        kredit_rp: tipeSupp === "cabang" ? frmNumber(totpsd) : frmNumber(xxTotalHpp),
                        jumlah_rp: tipeSupp === "cabang" ? frmNumber(totpsd * -1) : frmNumber(xxTotalHpp * -1), //psd
                        jumlah_mu: tipeSupp === "cabang" ? frmNumber(totpsd * -1) : frmNumber(xxTotalHpp * -1), //psd
                        catatan: "Persediaan barang No. SJ:  " + noDok,
                        persen: 0,
                        kode_dept: kodeDept,
                        kode_kerja: "",
                        approval: "N",
                        posting: "N",
                        rekonsiliasi: "N",
                        tgl_rekonsil: "",
                        userid: userid,
                        tgl_update: "",
                        nama_dept: "",
                        nama_kerja: "",
                        isledger: "",
                        subledger: "",
                        no_warkat: "",
                        tgl_valuta: "",
                        no_kerja: "",
                    };

                    // Tambahkan node baru ke state dan inkremen nilai i
                    setDataJurnal((state: any) => ({
                        ...state,
                        nodes: state.nodes.concat(newNodeJurnal),
                    }));
                    jurnalArray.push(newNodeJurnal);
                    // console.log("jurnalArray", jurnalArray);
                    // setDataJurnal({ nodes: newNodeJurnal });

                    i++;
                    // handleSaveDokumen(jurnalArray);
                    // handleUpdateGridJurnal(jurnalArray); ========
                    return jurnalArray;
                }
            }
            setShowLoadingModal(false);
            setIsLoadingModal(100);
        } catch (error) {
            showErrorPopup("Gagal generate jurnal otomatis: " + error, 350, "#dialog-warning");
        }
    };

    const handlegantiCustomer = () => {
        if (dataDetail.nodes.length > 0) {
            const hasEmptyFields = dataDetail.nodes.some((row: { diskripsi: string }) => row.diskripsi === "");
            if (hasEmptyFields === true && dataDetail.nodes.length === 1) {
                setModalDlgCustomer(true);
            } else {
                showErrorPopup(
                    "Detail Barang sudah terisi. Silahkan tekan tombol bersihkan terlebih dahulu untuk mengganti customer.",
                    450,
                    "#dialog-warning"
                );
            }
        }
    };

    const handleAddRowJurnal = () => {
        // Getting Id
        const id = dataJurnal.nodes.length + 1;

        // Insert new data to nodes
        const newNodes = {
            id_dokumen: id,
            id: id,
            dokumen: "SJ",
            tgl_dokumen: "",
            kode_akun: "",
            no_akun: "",
            nama_akun: "",
            tipe: "",
            kode_subledger: "",
            no_subledger: "",
            nama_subledger: "",
            kurs: 1.0,
            kode_mu: "IDR",
            debet_rp: "0.00",
            kredit_rp: "0.00",
            jumlah_rp: "0.00",
            jumlah_mu: "0.00",
            catatan: "",
            persen: 0,
            kode_dept: "",
            kode_kerja: "",
        };

        setDataJurnal((state: any) => ({
            ...state,
            nodes: state.nodes.concat(newNodes),
        }));
    };

    const handleDeleteRowJurnal = async (id: any) => {
        // Check dulu ada ngga
        // console.log("handleDeleteRowJurnal", id);

        // Percabangan klo id ada dan ngga
        if (id === 0) {
            // Hapus node terakhir
            const isConfirmed = await showCustomConfirm({
                htmlContent: `Hapus Data Jurnal Terakhir?`,
                target: "#dialog-warning",
            });
            if (isConfirmed) {
                setDataJurnal((state: any) => ({
                    ...state,
                    nodes: state.nodes.slice(0, -1),
                }));
                if (dataJurnal.nodes.length <= 1) {
                    handleAddRowJurnal();
                }
            }
        } else {
            // Hapus node dengan id yang sama
            const isConfirmed = await showCustomConfirm({
                htmlContent: `Hapus Data Jurnal Id ${id}?`,
                target: "#dialog-warning",
            });
            if (isConfirmed) {
                setDataJurnal((state: any) => ({
                    ...state,
                    nodes: state.nodes.filter((node: any) => node.id !== id),
                }));
            }
        }
    };

    return (
        <DialogComponent
            header={jenis === "baru" ? "SJ Baru" : `Surat Jalan (SJ): ${noDok}`}
            visible={visible}
            showCloseIcon
            width="90%"
            height="90%"
            close={() => onClose()}
            id="daftarBarang"
            name="daftarBarang"
            target="#main-target"
            isModal={true}
            animationSettings={{ effect: "FadeZoom", duration: 400, delay: 0 }}
            position={{ X: "center", Y: "center" }}
            style={{ position: "fixed" }}
            open={(args: any) => (args.preventFocus = true)}
            allowDragging={true}
        >
            <div className="App" id="dialog-warning" />
            {/* Loading */}
            <DialogComponent
                width="500px"
                height="200px"
                isModal={true}
                visible={showLoadingModal}
                close={() => setShowLoadingModal(false)}
                id="loading"
                name="loading"
            >
                <div className="flex h-full w-full items-center justify-center">
                    <div className="w-full flex-grow px-10">
                        <p>Proses : {currentIndicator}</p>
                        <LinearProgress
                            variant="buffer"
                            value={isLoadingModal}
                            color={errorMessage === "" ? "primary" : "error"}
                            valueBuffer={isLoadingModal}
                        />
                        <p className="text-red italic">{errorMessage === "" ? "" : errorMessage}</p>
                    </div>
                    {errorMessage.length !== 0 && (
                        <div className="me-8">
                            <button
                                className="justify-end bg-red-400 p-5"
                                onClick={() => {
                                    setShowLoadingModal(false);
                                    setErrorMessage("");
                                }}
                            >
                                Tutup
                            </button>
                        </div>
                    )}
                </div>
            </DialogComponent>
            <div>
                <div className="border border-gray-500 bg-[#fff]">
                    <div className="flex h-7 items-center gap-6 border-b border-gray-500 bg-warning ps-3 font-bold text-black">
                        <div className="text-base">Surat Jalan </div>
                        <div className="flex h-full items-center gap-2 bg-[#18dc7a] ps-2">
                            Divisi Penjualan {">>"}
                            <div className="flex">
                                <input id="kode_jual" placeholder="Divisi" type="text" value={kodeDivisiJual} readOnly className="h-full" />
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive p-1.5">
                        <table>
                            <tbody>
                                <tr className="bg-[#5c7ba0] font-bold text-white">
                                    <th className="w-[10%]">Tanggal Dokumen</th>
                                    <th className="w-[10%] bg-[#18dc7a] text-black">Tgl. Kirim Customer</th>
                                    <th className="w-[10%]">No. SJ</th>
                                    <th className="w-[50%]">Customer</th>
                                    <th className="w-[30%]">Gudang Pengeluaran</th>
                                </tr>
                                <tr className="text-xs text-black">
                                    <td className="border border-gray-500">
                                        <DatePickerComponent
                                            locale="id"
                                            style={{
                                                fontSize: "12px",
                                            }}
                                            cssClass="e-custom-style"
                                            enableMask={true}
                                            maskPlaceholder={{ day: "d", month: "M", year: "y" }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(tglDokumen).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => setTglDokumen(moment(args.value))}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </td>
                                    <td className="border border-gray-500">
                                        <DatePickerComponent
                                            locale="id"
                                            style={{ fontSize: "12px" }}
                                            cssClass="e-custom-style"
                                            enableMask={true}
                                            maskPlaceholder={{ day: "d", month: "M", year: "y" }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(tglTrx).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => setTglTrx(moment(args.value))}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </td>

                                    <td className="border border-gray-500">
                                        <input
                                            type="text"
                                            placeholder="Nomor SJ"
                                            id="idnosj"
                                            value={noDok}
                                            readOnly={true}
                                            className="text-center text-xs"
                                        />
                                    </td>

                                    <td className="border border-gray-500">
                                        <div className="flex">
                                            <input
                                                id="idcustomer"
                                                placeholder="Pilih Customer"
                                                value={selectedNamaCust}
                                                type="text"
                                                className={`w-full text-xs`}
                                                onChange={(e) => handleSelectOnChange(e, "customer")}
                                                readOnly
                                            />
                                            <div>
                                                <button
                                                    className="flex items-center justify-center rounded border border-white-light bg-[#eee] py-1 pr-1 font-semibold"
                                                    onClick={handlegantiCustomer}
                                                >
                                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-1" width="15" height="15" />
                                                </button>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="border border-gray-500">
                                        <DropDownListComponent
                                            key={kodeGudang}
                                            id="idGudang"
                                            dataSource={fillGudang}
                                            fields={{ value: "kode_gudang", text: "nama_gudang" }}
                                            placeholder="Pilih Gudang"
                                            value={kodeGudang}
                                            change={(args: any) => {
                                                // setNamaGudang(args.itemData.nama_gudang);
                                                handleSelectOnChange({ target: { value: args.value } }, "kode_gudang");
                                            }}
                                        />
                                    </td>
                                </tr>

                                {/* ================== TR BARIS KEDUA ============== */}
                                <tr className="bg-[#5c7ba0] font-bold text-white">
                                    <th className="w-[10%]">Cara Pengiriman</th>
                                    <th className="w-[13%]">Via Pengiriman (Ekspedisi)</th>
                                    <th colSpan={3} className="w-[60%]">
                                        Alamat Pengiriman
                                    </th>
                                </tr>

                                {/* ================== TR BARIS KETIGA ============== */}
                                <tr className="text-black">
                                    <td className="border border-gray-500">
                                        <div className="mb-[-8px] flex justify-center text-center text-xs">
                                            <input
                                                type="radio"
                                                id="idKirim"
                                                name="Dikirim"
                                                value="Dikirim"
                                                className="form-radio"
                                                checked={fob === "Dikirim"}
                                                onChange={() => setFob("Dikirim")}
                                            />
                                            <label htmlFor="Dikirim" className="mr-2">
                                                Dikirim
                                            </label>
                                            <input
                                                type="radio"
                                                id="idAmbil"
                                                name="Diambil"
                                                value="Diambil"
                                                className="form-radio mr-[5px]"
                                                checked={fob === "Diambil"}
                                                onChange={() => setFob("Diambil")}
                                            />
                                            <label htmlFor="Diambil">Diambil</label>
                                        </div>
                                    </td>

                                    <td className="border border-gray-500">
                                        <DropDownListComponent
                                            id="idEkspedisi"
                                            key={expedisiVia}
                                            dataSource={fillEkspedisiVia}
                                            fields={{ value: "via", text: "via" }}
                                            placeholder="Pilih Ekspedisi"
                                            value={expedisiVia}
                                            cssClass="no-border-dropdown"
                                            change={(args: any) => {
                                                handleSelectOnChange({ target: { value: args.value } }, "via");
                                            }}
                                        />
                                    </td>

                                    <td colSpan={3} rowSpan={5} className="border border-gray-500">
                                        <div className="flex h-full items-center justify-center">
                                            <div style={{ width: "100%", height: "100%" }}>
                                                <div className="relative rounded-lg bg-white">
                                                    <textarea
                                                        rows={5}
                                                        className="form-input box-border block h-full w-full resize-none border-0 bg-white p-1 text-xs text-gray-800 outline-none focus:ring-0"
                                                        value={alamatKirim}
                                                        readOnly
                                                        onChange={(e) => handleSelectOnChange(e, "alamatKirim")}
                                                    />
                                                    <button
                                                        className="items-center justify-center rounded border border-white-light bg-[#eee] p-1 font-semibold"
                                                        style={{ position: "absolute", top: "0px", right: "0px" }}
                                                        onClick={async () => {
                                                            if (!selectedKodeCust) {
                                                                await showErrorPopup("Silahkan pilih customer.", 350, "#dialog-warning");
                                                                setModalDlgCustomer(true);
                                                            } else {
                                                                setModalDlgAlamatKirim(true);
                                                            }
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faMagnifyingGlass} width="15" height="15" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>

                                {/* ================== TR BARIS KEEMPAT ============== */}
                                <tr className="bg-[#5c7ba0] font-bold text-white">
                                    <th colSpan={1} className="w-[10%]">
                                        No. Kendaraan
                                    </th>
                                    <th colSpan={1} className="w-[10%]">
                                        Pengemudi
                                    </th>
                                </tr>
                                <tr>
                                    <td className="border border-gray-500">
                                        <DropDownListComponent
                                            id="idNopol"
                                            key={nopol}
                                            dataSource={fillNopol}
                                            fields={{ value: "nopol", text: "nopol" }}
                                            placeholder="No. Kendaraan"
                                            value={nopol}
                                            cssClass="no-border-dropdown"
                                            change={(args: any) => {
                                                handleSelectOnChange({ target: { value: args.value } }, "kendaraankirim");
                                            }}
                                        />
                                    </td>
                                    <td className="border border-gray-500">
                                        <DropDownListComponent
                                            id="idPengemudi"
                                            key={pengemudi}
                                            dataSource={fillPengemudi}
                                            fields={{ value: "pengemudi", text: "pengemudi" }}
                                            placeholder="Pilih Pengemudi"
                                            value={pengemudi}
                                            cssClass="no-border-dropdown"
                                            change={(args: any) => {
                                                handleSelectOnChange({ target: { value: args.value } }, "pengemudi");
                                            }}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-1.5">
                        <div id="detail" className="mb-1">
                            <Tab.Group>
                                <Tab.List className="flex h-[30px] w-full items-center">
                                    <div className="flex gap-1">
                                        <Tab as={Fragment}>
                                            {({ selected }) => (
                                                <button
                                                    className={`${
                                                        selected ? "-mb-px border-b-white bg-white font-bold" : "bg-gray-100"
                                                    } rounded-t-md border border-gray-500  px-4 py-2 font-medium text-black`}
                                                >
                                                    1. Data Barang
                                                </button>
                                            )}
                                        </Tab>
                                        {kode_user === "ADMIN" && (
                                            <Tab as={Fragment}>
                                                {({ selected }) => (
                                                    <button
                                                        className={`${
                                                            selected ? "-mb-px border-b-white bg-white font-bold" : "bg-gray-100"
                                                        } rounded-t-md border border-gray-500 px-4 py-2 font-medium text-black`}
                                                    >
                                                        Data Jurnal
                                                    </button>
                                                )}
                                            </Tab>
                                        )}
                                    </div>
                                    <div className="ml-auto flex items-center">
                                        <div className="flex items-center justify-end bg-[#86f9e2] px-2 pt-1">
                                            <input
                                                style={{ marginTop: -6, marginRight: -1 }}
                                                checked={cetakTunai === "Y"}
                                                id="cetakTunai"
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => setCetakTunai(e.target.checked ? "Y" : "N")}
                                            />
                                            <label htmlFor="cetakTunai" className="ms-1 font-bold text-red-500">
                                                CETAK DENGAN AKUN TUNAI?
                                            </label>
                                        </div>
                                    </div>
                                </Tab.List>
                                <Tab.Panels className="mt-[1px] h-[200px] border border-gray-500">
                                    <Tab.Panel className="h-full">
                                        <div className="active h-full">
                                            <div className="flex h-full flex-col">
                                                {/* BUAT TABLENYA */}
                                                <div className="flex-1 overflow-hidden">
                                                    <GridDataBarang
                                                        dataApi={dataDetail}
                                                        handleUpdate={handleUpdateDetailSj}
                                                        handleselectcell={handleSelectedCell}
                                                        kode_entitas={kode_entitas}
                                                        userid={userid}
                                                        nilaiValueNoItem={nilaiValueNoItem}
                                                        nilaiValueNamaItem={nilaiValueNamaItem}
                                                        handleModalChange={handleModalChange}
                                                        nilaiTotalId={totalNum}
                                                        tipeValue={tipeValue}
                                                        handleModal={handleModal}
                                                        stateDlg={modalSjDlg}
                                                        stateKodeCust={selectedKodeCust}
                                                        stateKodeGudang={kodeGudang}
                                                        stateKodeSj={selectedKodeSj}
                                                        objekDetail={(dataobjekDetail: any) => handleSelectedData(dataobjekDetail)}
                                                        stateDetail={setDataDetail}
                                                        statusEdit={jenis}
                                                        stateDlgNoKontrak={"modalNoKontrak"}
                                                        stateKodeItem={nilaiKodeItem}
                                                        namaGudang={namaGudang}
                                                    />
                                                </div>
                                                <div className="me-2 mr-3 mt-auto flex items-center justify-end gap-6 text-xs text-black">
                                                    <div>Total Tonase</div>
                                                    <div>
                                                        <strong className="me-2">{frmNumber(totalBeratHeader)}</strong>
                                                        Kg
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Tab.Panel>
                                    {kode_user === "ADMIN" && (
                                        <Tab.Panel className="h-full">
                                            <div className="active h-full">
                                                <div className="flex h-full flex-col">
                                                    <div className="flex-1 overflow-hidden">
                                                        <GridDataJurnal
                                                            handleDeleteRowJurnal={handleDeleteRowJurnal}
                                                            handleAddRowJurnal={handleAddRowJurnal}
                                                            handleAutoJurnal={handleAutoJurnal}
                                                            dataApi={dataJurnal}
                                                            dataDept={listDepartemen}
                                                            handleUpdate={handleUpdateJurnal}
                                                            handleselectcell={handleselectcell}
                                                            kode_entitas={kode_entitas}
                                                            userid={userid}
                                                            nilaiValueNoItem={nilaiValueNoAkun}
                                                            nilaiValueNamaItem={nilaiValueNamaAkun}
                                                            handleModalAkunChange={handleModalAkunChange}
                                                            nilaiTotalId={totalNum}
                                                            tipeValue={tipeValue}
                                                            handleModalAkun={handleModalAkun}
                                                        />
                                                    </div>

                                                    <div className="me-2 ml-auto mr-3 mt-auto flex flex-col gap-1 text-xs text-black">
                                                        <div className="flex gap-12">
                                                            <div className="w-20">Total Db/Kr</div>
                                                            <div className="w-24 text-right">{frmNumber(totalDebet)}</div>
                                                            <div className="w-24 text-right">{frmNumber(totalKredit)}</div>
                                                        </div>
                                                        <div className="flex gap-12">
                                                            <div className="w-20">Selisih</div>
                                                            <div className="w-24 text-right">{frmNumber(totalDebet - totalKredit)}</div>
                                                            <div className="w-24"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab.Panel>
                                    )}
                                </Tab.Panels>
                            </Tab.Group>
                        </div>
                    </div>

                    {/* ===== PANEL BAWAH CATATAN==================== */}
                    <div className="p-1.5">
                        <div>
                            <label htmlFor="catatan" className="text-xs text-black">
                                Catatan:
                            </label>
                            <form>
                                <div className="w-full rounded-lg border border-gray-200 bg-gray-50">
                                    <label className="sr-only">Publish post</label>
                                    <textarea
                                        id="editor"
                                        rows={3}
                                        className="form-input block w-full border border-gray-500 bg-white px-1 text-xs text-gray-800 outline-0 focus:ring-0"
                                        placeholder=""
                                        value={catatan}
                                        onChange={(e) => {
                                            handleSelectOnChange(e, "catatan");
                                        }}
                                        style={{ height: 100 }}
                                    ></textarea>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ====== PANEL SIMPAN, BATAL, DAFTAR */}
                <div className="my-2 flex justify-between">
                    <div className="flex">
                        <button
                            type="submit"
                            className={`mr-1 flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white ${
                                !isBersihkanData
                                    ? "bg-gray-500"
                                    : "bg-[#3b3f5c] hover:bg-[#4a4e69] focus:outline-none focus:ring-4 focus:ring-gray-300"
                            }`}
                            onClick={async () => {
                                if (!selectedKodeCust) {
                                    await showErrorPopup("Silahkan pilih customer.", 350, "#dialog-warning");
                                    setModalDlgCustomer(true);
                                } else {
                                    setModalDlgDaftarSpm(true);
                                }
                            }}
                            disabled={!isBersihkanData}
                        >
                            <FontAwesomeIcon icon={faFileArchive} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Daftar SPM
                        </button>
                        {statusDok !== "Tertutup" && !isCetakDokumen && (
                            <button
                                type="submit"
                                className="flex items-center rounded-md bg-[#3b3f5c] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4a4e69] focus:outline-none focus:ring-4 focus:ring-gray-300"
                                onClick={() => HandleRemoveAllRows(dataDetail, setDataDetail, handleDokumenbaru, setDataJurnal, handleSubmitJurnal)}
                            >
                                <FontAwesomeIcon icon={faBackward} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                Bersihkan
                            </button>
                        )}
                    </div>
                    <div className="flex">
                        {statusDok !== "Tertutup" && !isCetakDokumen && (
                            <button
                                type="submit"
                                className="mr-1 flex items-center rounded-md bg-[#3b3f5c] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4a4e69] focus:outline-none focus:ring-4 focus:ring-gray-300"
                                onClick={() => handleSaveDoc()}
                                disabled={statusDok !== "Terbuka"}
                            >
                                <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                Simpan
                            </button>
                        )}
                        <button
                            type="submit"
                            className={`mr-1 flex items-center rounded-md bg-[#3b3f5c] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4a4e69] focus:outline-none focus:ring-4 focus:ring-gray-300`}
                            onClick={() => onClose()}
                        >
                            <FontAwesomeIcon icon={faCancel} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Tutup
                        </button>
                    </div>
                </div>

                {/* ====== Semua Dialog disimpan disini */}
                {modalDlgCustomer && (
                    <DialogCustomer
                        isOpen={modalDlgCustomer}
                        onClose={() => setModalDlgCustomer(false)}
                        onSelectData={(
                            kode_cust: any,
                            no_cust: any,
                            nama_relasi: any,
                            kode_pajak: any,
                            kode_mu: any,
                            kurs: any,
                            alamat_kirim1: any,
                            tipe: any,
                            cetak_tunai: any
                        ) => handleSelectDataCust(kode_cust, no_cust, nama_relasi, kode_pajak, kode_mu, kurs, alamat_kirim1, tipe, cetak_tunai)}
                    />
                )}

                {modalDlgAlamatKirim && (
                    <DialogAlamatKirim
                        isOpen={modalDlgAlamatKirim}
                        onClose={() => setModalDlgAlamatKirim(false)}
                        onSelectData={(alamat: any, utama: any) => handleSelectedAlamat(alamat, utama)}
                        kode_cust={selectedKodeCust}
                        nama_cust={selectedNamaCust}
                        handleNamaWilayah={""}
                        nilaiTotalId={""}
                    />
                )}

                {modalDlgDaftarSpm && (
                    <DialogDaftarSpm
                        isOpen={modalDlgDaftarSpm}
                        onClose={() => setModalDlgDaftarSpm(false)}
                        onSelectDataSpm={(kode_dok: string) => handleSelectedDaftarSpm(kode_dok)}
                        kodeCust={selectedKodeCust}
                        kontrak={"Y"}
                    />
                )}

                {modalAkunDlg && (
                    <DialogNoAkun
                        isOpen={modalAkunDlg}
                        onClose={() => setModalAkunDlg(false)}
                        onSelectData={(dataObject: any) => handleSelectedDataJurnal(dataObject, "akun_jurnal")}
                        cariNo={nilaiValueNoAkun}
                        cariNama={nilaiValueNamaAkun}
                        tipeValue={tipeValue}
                    />
                )}

                {modalSuppJurnal && (
                    <DialogSuppJurnal
                        isOpen={modalSuppJurnal}
                        onClose={() => setModalSuppJurnal(false)}
                        onSelectData={(dataObject: any) => handleSelectedDataJurnal(dataObject, "supp_jurnal")}
                    />
                )}

                {/* Cari akun Pendapatan Usaha lainnya */}
                {modalSubledger && (
                    <DialogSubledger
                        isOpen={modalSubledger}
                        onClose={() => setModalSubledger(false)}
                        onSelectData={(dataObject: any) => handleSelectedDataJurnal(dataObject, "subledger")}
                    />
                )}
            </div>
        </DialogComponent>
    );
}
