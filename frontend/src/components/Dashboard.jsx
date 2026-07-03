import React, { useState, useEffect } from 'react';
import axios from 'axios';

const useSessionState = (key, initialValue) => {
    const [state, setState] = useState(() => {
        const stored = sessionStorage.getItem(key);
        if (stored !== null) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return stored;
            }
        }
        return initialValue;
    });

    useEffect(() => {
        sessionStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
};

const Dashboard = () => {
    // State untuk menyimpan data dari database
    const [dataHoras, setDataHoras] = useState([]);
    const [dataManual, setDataManual] = useState([]);
    
    // State untuk Pagination & Search Horas (tersimpan di sessionStorage)
    const [pageHoras, setPageHoras] = useSessionState('pageHoras', 0);
    const [searchHoras, setSearchHoras] = useSessionState('searchHoras', "");
    const [previousPageHoras, setPreviousPageHoras] = useSessionState('previousPageHoras', 0);
    const [totalPageHoras, setTotalPageHoras] = useState(0);

    // State untuk Pagination & Search Manual (tersimpan di sessionStorage)
    const [pageManual, setPageManual] = useSessionState('pageManual', 0);
    const [searchManual, setSearchManual] = useSessionState('searchManual', "");
    const [previousPageManual, setPreviousPageManual] = useSessionState('previousPageManual', 0);
    const [totalPageManual, setTotalPageManual] = useState(0);

    // State Global untuk ukuran tabel (Dropdown Entri, tersimpan di sessionStorage)
    const [pageSize, setPageSize] = useSessionState('pageSize', 10);

    // Fungsi mengambil data Tabel Horas dari Java
    const fetchHoras = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/horas?page=${pageHoras}&size=${pageSize}&search=${searchHoras}`);
            setDataHoras(res.data.content);
            setTotalPageHoras(res.data.totalPages);
        } catch (error) {
            console.error("Error fetch Horas:", error);
        }
    };

    // Fungsi mengambil data Tabel Manual dari Java
    const fetchManual = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/manual?page=${pageManual}&size=${pageSize}&search=${searchManual}`);
            setDataManual(res.data.content);
            setTotalPageManual(res.data.totalPages);
        } catch (error) {
            console.error("Error fetch Manual:", error);
        }
    };

    // Otomatis memanggil fungsi fetch tiap kali halaman, ukuran, atau pencarian berubah
    useEffect(() => {
        fetchHoras();
    }, [pageHoras, pageSize, searchHoras]);

    useEffect(() => {
        fetchManual();
    }, [pageManual, pageSize, searchManual]);

    // Fungsi saat Tombol Action "Masukkan ke Manual" diklik
    const handleSync = async (row) => {
        // Sesuaikan nama field dengan Entity TabelManual di Spring Boot
        const payload = {
            id: row.idCluster,
            lop: row.namaLop,
            cham: row.cham,
            region: row.regional,
            branch: row.branch
        };

        try {
            const res = await axios.post('http://localhost:8080/api/sync-horas', payload);
            if (res.status === 200) {
                // Update tabel Horas agar langsung berwarna hijau tanpa memuat ulang web
                setDataHoras(prev => prev.map(item => item.idCluster === row.idCluster ? { ...item, status: 'ada' } : item));
                alert("Data berhasil disinkronisasi ke Tabel Manual!");
                // Panggil ulang data manual agar baris yang baru ditambah langsung muncul
                fetchManual(); 
            }
        } catch (error) {
            alert("Gagal sinkronisasi data.");
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Dashboard Sinkronisasi Data</h1>
            
            {/* FITUR DROPDOWN ENTRY */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '10px' }}>Tampilkan Entri: </label>
                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                </select>
            </div>

            <hr />

            {/* BAGIAN TABEL HORAS */}
            <h2>Tabel Data Horas</h2>
            <input 
                type="text" 
                placeholder="Cari nama LoP..." 
                value={searchHoras} 
                onChange={(e) => {
                    const newVal = e.target.value;
                    if (newVal !== "" && searchHoras === "") {
                        setPreviousPageHoras(pageHoras);
                    }
                    setSearchHoras(newVal);
                    if (newVal === "") {
                        setPageHoras(previousPageHoras);
                    } else {
                        setPageHoras(0);
                    }
                }} 
                style={{ marginBottom: '10px', padding: '8px', width: '300px' }}
            />
            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                <thead style={{ backgroundColor: '#f2f2f2' }}>
                    <tr>
                        <th>ID Cluster</th><th>Nama LoP</th><th>Regional</th><th>Branch</th><th>Status</th><th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {dataHoras.map(row => (
                        <tr key={row.idCluster}>
                            <td>{row.idCluster}</td><td>{row.namaLop}</td><td>{row.regional}</td><td>{row.branch}</td>
                            <td style={{ color: row.status === 'ada' ? 'green' : 'red', fontWeight: 'bold' }}>
                                {row.status.toUpperCase()}
                            </td>
                            <td>
                                {row.status === 'tidak ada' ? (
                                    <button onClick={() => handleSync(row)} style={{ cursor: 'pointer', backgroundColor: '#007bff', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px' }}>
                                        Masukkan ke Manual
                                    </button>
                                ) : (
                                    <span style={{ color: 'gray', fontStyle: 'italic' }}>Selesai</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Pagination Horas */}
            <div style={{ marginBottom: '30px' }}>
                <button disabled={pageHoras === 0} onClick={() => setPageHoras(pageHoras - 1)}>Sebelumnya</button>
                <span style={{ margin: '0 15px' }}>Halaman {pageHoras + 1} dari {totalPageHoras}</span>
                <button disabled={pageHoras + 1 >= totalPageHoras} onClick={() => setPageHoras(pageHoras + 1)}>Selanjutnya</button>
            </div>

            <hr />

            {/* BAGIAN TABEL MANUAL */}
            <h2>Tabel Data Manual</h2>
            <input 
                type="text" 
                placeholder="Cari nama LoP..." 
                value={searchManual} 
                onChange={(e) => {
                    const newVal = e.target.value;
                    if (newVal !== "" && searchManual === "") {
                        setPreviousPageManual(pageManual);
                    }
                    setSearchManual(newVal);
                    if (newVal === "") {
                        setPageManual(previousPageManual);
                    } else {
                        setPageManual(0);
                    }
                }} 
                style={{ marginBottom: '10px', padding: '8px', width: '300px' }}
            />
            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                <thead style={{ backgroundColor: '#f2f2f2' }}>
                    <tr>
                        <th>ID</th><th>LoP</th><th>Region</th><th>Branch</th><th>ChAM</th>
                    </tr>
                </thead>
                <tbody>
                    {dataManual.map(row => (
                        <tr key={row.id}>
                            <td>{row.id}</td><td>{row.lop}</td><td>{row.region}</td><td>{row.branch}</td><td>{row.cham}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Pagination Manual */}
            <div>
                <button disabled={pageManual === 0} onClick={() => setPageManual(pageManual - 1)}>Sebelumnya</button>
                <span style={{ margin: '0 15px' }}>Halaman {pageManual + 1} dari {totalPageManual}</span>
                <button disabled={pageManual + 1 >= totalPageManual} onClick={() => setPageManual(pageManual + 1)}>Selanjutnya</button>
            </div>
        </div>
    );
};

export default Dashboard;