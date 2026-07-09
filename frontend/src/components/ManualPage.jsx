import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import useSessionState from '../hooks/useSessionState';

const ManualPage = () => {
    const { showToast } = useOutletContext(); // Mendapatkan fungsi showToast dari Layout
    const [dataManual, setDataManual] = useState([]);
    const [isLoadingManual, setIsLoadingManual] = useState(false);
    
    // States
    const [pageManual, setPageManual] = useSessionState('pageManual', 0);
    const [searchManual, setSearchManual] = useSessionState('searchManual', "");
    const [previousPageManual, setPreviousPageManual] = useSessionState('previousPageManual', 0);
    const [filterRegionManual, setFilterRegionManual] = useSessionState('filterRegionManual', "");
    const [filterBranchManual, setFilterBranchManual] = useSessionState('filterBranchManual', "");
    const [pageSizeManual, setPageSizeManual] = useSessionState('pageSizeManual', 10);
    const [totalPageManual, setTotalPageManual] = useState(0);

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

    useEffect(() => {
        fetchManual();
    }, [pageManual, pageSizeManual, searchManual, filterRegionManual, filterBranchManual]);

    const handleDelete = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus data ini dari Tabel Manual?")) {
            return;
        }
        
        try {
            const res = await axios.delete(`http://localhost:8080/api/manual?id=${encodeURIComponent(id)}`);
            if (res.status === 200) {
                showToast("Data berhasil dihapus dari Tabel Manual!", "success");
                fetchManual();
            }
        } catch (error) {
            showToast("Gagal menghapus data.", "error");
            console.error(error);
        }
    };

    const handleExport = () => {
        const url = `http://localhost:8080/api/manual/export?search=${encodeURIComponent(searchManual)}&region=${encodeURIComponent(filterRegionManual)}&branch=${encodeURIComponent(filterBranchManual)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="card" style={{ marginTop: '20px' }}>
            <div className="flex-between" style={{ alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 style={{ margin: 0 }}>Tabel Data Manual</h2>
                    <button className="btn-export-beautiful" onClick={handleExport}>
                        <span className="export-icon-small"></span>
                        Export Data CSV
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
                        if (newVal !== "" && searchManual === "") setPreviousPageManual(pageManual);
                        setSearchManual(newVal);
                        setPageManual(newVal === "" ? previousPageManual : 0);
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
                                <th style={{ borderTopLeftRadius: '6px' }}>ID</th>
                                <th>LOP</th>
                                <th>REGION</th>
                                <th>BRANCH</th>
                                <th>CHAM</th>
                                <th style={{ borderTopRightRadius: '6px' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataManual.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada data.</td>
                                </tr>
                            ) : (
                                dataManual.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.id}</td>
                                        <td>{row.lop}</td>
                                        <td>{row.region}</td>
                                        <td>{row.branch}</td>
                                        <td>{row.cham}</td>
                                        <td>
                                            <button className="btn-danger" onClick={() => handleDelete(row.id)}>
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="pagination">
                <button 
                    className="btn-page"
                    disabled={pageManual === 0} 
                    onClick={() => setPageManual(pageManual - 1)}
                >
                    &laquo; Prev
                </button>

                <div className="page-numbers" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    {(() => {
                        let pages = [];
                        let startPage = Math.max(0, pageManual - 2);
                        let endPage = Math.min(Math.max(0, totalPageManual - 1), pageManual + 2);

                        if (startPage > 0) {
                            pages.push(<button key={0} className="btn-page" onClick={() => setPageManual(0)}>1</button>);
                            if (startPage > 1) pages.push(<span key="e1">...</span>);
                        }

                        for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                                <button 
                                    key={i} 
                                    className={`btn-page ${pageManual === i ? 'active' : ''}`} 
                                    onClick={() => setPageManual(i)}
                                    style={pageManual === i ? { backgroundColor: 'var(--primary-red)', color: 'white', borderColor: 'var(--primary-red)' } : {}}
                                >
                                    {i + 1}
                                </button>
                            );
                        }

                        if (endPage < totalPageManual - 1) {
                            if (endPage < totalPageManual - 2) pages.push(<span key="e2">...</span>);
                            pages.push(<button key={totalPageManual - 1} className="btn-page" onClick={() => setPageManual(totalPageManual - 1)}>{totalPageManual}</button>);
                        }

                        return pages.length > 0 ? pages : <button className="btn-page active" style={{ backgroundColor: 'var(--primary-red)', color: 'white' }}>1</button>;
                    })()}
                </div>

                <button 
                    className="btn-page"
                    disabled={pageManual >= totalPageManual - 1 || totalPageManual === 0} 
                    onClick={() => setPageManual(pageManual + 1)}
                >
                    Next &raquo;
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lompat ke:</span>
                    <input 
                        type="number" 
                        min={1} 
                        max={totalPageManual}
                        className="input-field"
                        style={{ width: '60px', padding: '4px 8px', height: 'auto', textAlign: 'center' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                let val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1 && val <= totalPageManual) {
                                    setPageManual(val - 1);
                                }
                                e.target.value = '';
                            }
                        }}
                        placeholder="..."
                    />
                </div>
            </div>
        </div>
    );
};

export default ManualPage;
