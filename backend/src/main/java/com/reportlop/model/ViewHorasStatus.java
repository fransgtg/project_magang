package com.reportlop.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "view_horas_status")
public class ViewHorasStatus {

    @Id
    @Column(name = "id_cluster")
    private String idCluster; 

    @Column(name = "nama_lop")
    private String namaLop;

    @Column(name = "regional")
    private String regional;

    @Column(name = "branch")
    private String branch;

    @Column(name = "cluster")
    private String cluster;

    @Column(name = "cham")
    private String cham;

    @Column(name = "status")
    private String status;

    // --- GETTER & SETTER ---
    
    public String getIdCluster() { return idCluster; }
    public void setIdCluster(String idCluster) { this.idCluster = idCluster; }

    public String getNamaLop() { return namaLop; }
    public void setNamaLop(String namaLop) { this.namaLop = namaLop; }

    public String getRegional() { return regional; }
    public void setRegional(String regional) { this.regional = regional; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public String getCluster() { return cluster; }
    public void setCluster(String cluster) { this.cluster = cluster; }

    public String getCham() { return cham; }
    public void setCham(String cham) { this.cham = cham; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}