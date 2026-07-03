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
    // State untuk tema (dark/light)
    const [theme, setTheme] = useSessionState('appTheme', 'light');

    // State untuk menyimpan data dari database
    const [dataHoras, setDataHoras] = useState([]);
    const [dataManual, setDataManual] = useState([]);
    
    // State untuk Pagination, Search & Filter Horas (tersimpan di sessionStorage)
    const [pageHoras, setPageHoras] = useSessionState('pageHoras', 0);
    const [searchHoras, setSearchHoras] = useSessionState('searchHoras', "");
    const [previousPageHoras, setPreviousPageHoras] = useSessionState('previousPageHoras', 0);
    const [filterRegionalHoras, setFilterRegionalHoras] = useSessionState('filterRegionalHoras', "");
    const [filterBranchHoras, setFilterBranchHoras] = useSessionState('filterBranchHoras', "");
    const [filterStatusHoras, setFilterStatusHoras] = useSessionState('filterStatusHoras', "");
    const [pageSizeHoras, setPageSizeHoras] = useSessionState('pageSizeHoras', 10);
    const [totalPageHoras, setTotalPageHoras] = useState(0);

    // State untuk Pagination, Search & Filter Manual (tersimpan di sessionStorage)
    const [pageManual, setPageManual] = useSessionState('pageManual', 0);
    const [searchManual, setSearchManual] = useSessionState('searchManual', "");
    const [previousPageManual, setPreviousPageManual] = useSessionState('previousPageManual', 0);
    const [filterRegionManual, setFilterRegionManual] = useSessionState('filterRegionManual', "");
    const [filterBranchManual, setFilterBranchManual] = useSessionState('filterBranchManual', "");
    const [pageSizeManual, setPageSizeManual] = useSessionState('pageSizeManual', 10);
    const [totalPageManual, setTotalPageManual] = useState(0);

    // State untuk Loading Indicator
    const [isLoadingHoras, setIsLoadingHoras] = useState(false);
    const [isLoadingManual, setIsLoadingManual] = useState(false);

    // State untuk Toast Notification
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // State untuk Bulk Sync (hanya melacak baris yang dicentang)
    const [selectedRows, setSelectedRows] = useState(new Map());

    // Fungsi mengambil data Tabel Horas dari Java
    const fetchHoras = async () => {
        setIsLoadingHoras(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/horas?page=${pageHoras}&size=${pageSizeHoras}&search=${searchHoras}&regional=${filterRegionalHoras}&branch=${filterBranchHoras}&status=${filterStatusHoras}`);
            setDataHoras(res.data.content);
            setTotalPageHoras(res.data.totalPages);
        } catch (error) {
            console.error("Error fetch Horas:", error);
        } finally {
            setIsLoadingHoras(false);
        }
    };

    // Fungsi mengambil data Tabel Manual dari Java
    const fetchManual = async () => {
        setIsLoadingManual(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/manual?page=${pageManual}&size=${pageSizeManual}&search=${searchManual}&region=${filterRegionManual}&branch=${filterBranchManual}`);
            setDataManual(res.data.content);
            setTotalPageManual(res.data.totalPages);
        } catch (error) {
            console.error("Error fetch Manual:", error);
        } finally {
            setIsLoadingManual(false);
        }
    };

    // Otomatis memanggil fungsi fetch tiap kali halaman, ukuran, pencarian, atau filter berubah
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchHoras();
        }, 300); // Tunda 300ms agar tidak spam request saat mengetik
        return () => clearTimeout(timeoutId);
    }, [pageHoras, pageSizeHoras, searchHoras, filterRegionalHoras, filterBranchHoras, filterStatusHoras]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchManual();
        }, 300); // Tunda 300ms
        return () => clearTimeout(timeoutId);
    }, [pageManual, pageSizeManual, searchManual, filterRegionManual, filterBranchManual]);

    // Efek untuk mengubah tema HTML
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

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
                showToast("Data berhasil disinkronisasi ke Tabel Manual!", "success");
                fetchHoras();
                fetchManual();
            }
        } catch (error) {
            showToast("Gagal sinkronisasi data.", "error");
            console.error(error);
        }
    };

    // FUNGSI BULK SYNC
    const availableRows = dataHoras.filter(row => row.status === 'tidak ada');
    const allVisibleSelected = availableRows.length > 0 && availableRows.every(row => selectedRows.has(row.idCluster));

    const handleSelectAll = (e) => {
        const newSelected = new Map(selectedRows);
        if (e.target.checked) {
            availableRows.forEach(row => newSelected.set(row.idCluster, row));
        } else {
            availableRows.forEach(row => newSelected.delete(row.idCluster));
        }
        setSelectedRows(newSelected);
    };

    const handleSelectRow = (row, checked) => {
        const newSelected = new Map(selectedRows);
        if (checked) {
            newSelected.set(row.idCluster, row);
        } else {
            newSelected.delete(row.idCluster);
        }
        setSelectedRows(newSelected);
    };

    const handleBulkSync = async () => {
        if (selectedRows.size === 0) return;
        
        const payload = Array.from(selectedRows.values()).map(row => ({
            id: row.idCluster,
            lop: row.namaLop,
            cham: row.cham,
            region: row.regional,
            branch: row.branch
        }));

        try {
            const res = await axios.post('http://localhost:8080/api/sync-horas-bulk', payload);
            if (res.status === 200) {
                // Update tabel Horas secara lokal
                setDataHoras(prev => prev.map(item => selectedRows.has(item.idCluster) ? { ...item, status: 'ada' } : item));
                showToast(`Berhasil sinkronisasi ${selectedRows.size} data massal!`, "success");
                setSelectedRows(new Map()); // Kosongkan pilihan
                fetchManual(); 
            }
        } catch (error) {
            showToast("Gagal melakukan sinkronisasi massal.", "error");
            console.error(error);
        }
    };

    // Fungsi Hapus Data dari Manual
    const handleDelete = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus data ini dari Tabel Manual?")) {
            return;
        }
        
        try {
            const res = await axios.delete(`http://localhost:8080/api/manual?id=${encodeURIComponent(id)}`);
            if (res.status === 200) {
                showToast("Data berhasil dihapus dari Tabel Manual!", "success");
                fetchManual();
                fetchHoras(); // Memperbarui status di tabel horas kembali menjadi 'tidak ada'
            }
        } catch (error) {
            showToast("Gagal menghapus data.", "error");
            console.error(error);
        }
    };

    // Fungsi Export CSV
    const handleExport = () => {
        const url = `http://localhost:8080/api/manual/export?search=${encodeURIComponent(searchManual)}&region=${encodeURIComponent(filterRegionManual)}&branch=${encodeURIComponent(filterBranchManual)}`;
        window.open(url, '_blank');
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Report LoP</h1>
                <button 
                    className="btn-primary" 
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    style={{ backgroundColor: theme === 'light' ? '#333' : '#f0f0f0', color: theme === 'light' ? '#fff' : '#333' }}
                >
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
            </div>

            {/* BAGIAN TABEL HORAS */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h2>Tabel Data Horas</h2>
                        {selectedRows.size > 0 && (
                            <button className="btn-primary" onClick={handleBulkSync} style={{ marginBottom: '20px', backgroundColor: '#058f44' }}>
                                Sinkronkan Terpilih ({selectedRows.size})
                            </button>
                        )}
                    </div>
                    <div className="entry-select-container" style={{ marginBottom: 0 }}>
                        <label>Tampilkan: </label>
                        <select className="input-field" value={pageSizeHoras} onChange={(e) => { setPageSizeHoras(Number(e.target.value)); setPageHoras(0); }}>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
                
                <div className="filter-container">
                    <input 
                        type="text" 
                        className="input-field"
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
                        style={{ flex: '1', minWidth: '200px' }}
                    />
                    <input 
                        type="text" 
                        className="input-field"
                        placeholder="Filter Regional..." 
                        value={filterRegionalHoras} 
                        onChange={(e) => { setFilterRegionalHoras(e.target.value); setPageHoras(0); }} 
                    />
                    <input 
                        type="text" 
                        className="input-field"
                        placeholder="Filter Branch..." 
                        value={filterBranchHoras} 
                        onChange={(e) => { setFilterBranchHoras(e.target.value); setPageHoras(0); }} 
                    />
                    <select 
                        className="input-field"
                        value={filterStatusHoras} 
                        onChange={(e) => { setFilterStatusHoras(e.target.value); setPageHoras(0); }} 
                    >
                        <option value="">Semua Status</option>
                        <option value="ada">Ada</option>
                        <option value="tidak ada">Tidak Ada</option>
                    </select>
                </div>
                
                {isLoadingHoras ? (
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px', textAlign: 'center' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={allVisibleSelected} 
                                            onChange={handleSelectAll} 
                                            disabled={availableRows.length === 0}
                                            style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                        />
                                    </th>
                                    <th>ID Cluster</th><th>Nama LoP</th><th>Regional</th><th>Branch</th><th>ChAM</th><th>Status</th><th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataHoras.map(row => (
                                    <tr key={row.idCluster}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input 
                                                type="checkbox"
                                                checked={selectedRows.has(row.idCluster)}
                                                onChange={(e) => handleSelectRow(row, e.target.checked)}
                                                disabled={row.status === 'ada'}
                                                style={{ transform: 'scale(1.2)', cursor: row.status === 'ada' ? 'not-allowed' : 'pointer' }}
                                            />
                                        </td>
                                        <td>{row.idCluster}</td><td>{row.namaLop}</td><td>{row.regional}</td><td>{row.branch}</td><td>{row.cham}</td>
                                        <td>
                                            <span className={`badge ${row.status === 'ada' ? 'ada' : 'tidak-ada'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td>
                                            {row.status === 'tidak ada' ? (
                                                <button className="btn-primary" onClick={() => handleSync(row)}>
                                                    Masukkan ke Manual
                                                </button>
                                            ) : (
                                                <span className="badge selesai">Selesai</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Pagination Horas */}
                <div className="pagination">
                    <button className="btn-page" disabled={pageHoras === 0} onClick={() => setPageHoras(pageHoras - 1)}>Sebelumnya</button>
                    <span>Halaman {pageHoras + 1} dari {totalPageHoras}</span>
                    <button className="btn-page" disabled={pageHoras + 1 >= totalPageHoras} onClick={() => setPageHoras(pageHoras + 1)}>Selanjutnya</button>
                </div>
            </div>

            {/* BAGIAN TABEL MANUAL */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h2>Tabel Data Manual</h2>
                        <button className="btn-primary" onClick={handleExport} style={{ marginBottom: '20px', backgroundColor: '#058f44' }}>
                            Export CSV
                        </button>
                    </div>
                    <div className="entry-select-container" style={{ marginBottom: 0 }}>
                        <label>Tampilkan: </label>
                        <select className="input-field" value={pageSizeManual} onChange={(e) => { setPageSizeManual(Number(e.target.value)); setPageManual(0); }}>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                <div className="filter-container">
                    <input 
                        type="text" 
                        className="input-field"
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
                        style={{ flex: '1', minWidth: '200px' }}
                    />
                    <input 
                        type="text" 
                        className="input-field"
                        placeholder="Filter Regional..." 
                        value={filterRegionManual} 
                        onChange={(e) => { setFilterRegionManual(e.target.value); setPageManual(0); }} 
                    />
                    <input 
                        type="text" 
                        className="input-field"
                        placeholder="Filter Branch..." 
                        value={filterBranchManual} 
                        onChange={(e) => { setFilterBranchManual(e.target.value); setPageManual(0); }} 
                    />
                </div>
                
                {isLoadingManual ? (
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th><th>LoP</th><th>Region</th><th>Branch</th><th>ChAM</th><th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataManual.map(row => (
                                    <tr key={row.id}>
                                        <td>{row.id}</td><td>{row.lop}</td><td>{row.region}</td><td>{row.branch}</td><td>{row.cham}</td>
                                        <td>
                                            <button className="btn-danger" onClick={() => handleDelete(row.id)}>
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Pagination Manual */}
                <div className="pagination">
                    <button className="btn-page" disabled={pageManual === 0} onClick={() => setPageManual(pageManual - 1)}>Sebelumnya</button>
                    <span>Halaman {pageManual + 1} dari {totalPageManual}</span>
                    <button className="btn-page" disabled={pageManual + 1 >= totalPageManual} onClick={() => setPageManual(pageManual + 1)}>Selanjutnya</button>
                </div>
            </div>

            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast ${t.type}`}>
                        {t.type === 'success' ? '✅' : '❌'} {t.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;