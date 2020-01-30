import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import {InspectionService, InspectionStatus} from '../inspection.service';
import {StorageService} from 'src/app/core/service/storage.service';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {InspectionTableComponent} from '../inspection-table/inspection-table.component';
import {NewSnInputComponent} from '../new-sn-input/new-sn-input.component';
import {Router} from '@angular/router';
import {PonGatewayService} from './pon-gateway.service';
import {HttpClient} from '@angular/common/http';

declare const COS: any;

@Component({
  selector: 'app-pon-gateway',
  templateUrl: './pon-gateway.component.html',
  styleUrls: ['./pon-gateway.component.less']
})
export class PonGatewayComponent implements OnInit {
  onlineId = '';
  delectOnlineId = '';
  title = '';
  business = '';
  companyName = '';
  address = '';
  text = '';
  filePath = '';
  pptPath = '';
  videoPath = '';
  fileList = [];
  pptFileList = [];
  videoFileList = [];
  selectedOperator;
  onlineSession = [];
  // ————————————————
  selectId = '';
  delectSelectId = '';
  selectStartTime = '';
  selectEndTime = '';
  selectMeetingAddress = '';
  selectAddress = '';
  selectSponsor = '';
  selectTitle = '';
  selectText = '';
  selectIco = '';
  selectFileList = [];
  selectSession = [];
  selectType = [];
  sendTypeId = '';
  deleteTypeId = '';
  // _________________
  createCompanyName = '';
  companyBusiness = '';
  companyIntro = '';
  createCompanyAddress = '';
  companyScale = '';
  companyFileList = [];
  companyPath = '';
  companyId = '';
  delectCompanyId = '';
  toMeetingId = '';
  deleteMeetingId = '';
  companySession = '';

  // ___________________
  jobName = '';
  jobBusiness = '';
  jobIntro = '';
  jobEducation = '';
  jobPay = '';
  jobPubTime = '';
  jobId = '';
  jobcompanyId = '';
  delectJobId = '';
  toCompanyId = '';
  deleteCompanyId = '';
  jobSession = '';
  // ___________________
  precticeTitle = '';
  precticeCompany = '';
  precticeAddress = '';
  precticeEducation = '';
  precticeTime = '';
  precticePay = '';
  precticeInfo = '';
  precticeFileList = [];
  precticePath = '';
  practiceId = '';
  deletePracticeId = '';
  practiceSession = '';
  // ___________________
  swiperonlineId = '';
  swiperId = '';
  swiperFileList = [];
  swiperFilePath = '';
  swiperSession = '';
  loading = false;

  cos: any;

  constructor(
    private service: PonGatewayService,
    private iService: InspectionService,
    private storageService: StorageService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private router: Router,
    private httpClient: HttpClient,
    private message: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.getAllOnline();
    // 写死密钥
    this.cos = new COS({
      SecretId: 'AKIDUeBbvMA1GTINMI9rRzV2dCoGfIsQmGcx',
      SecretKey: 'Rp6KTVQEnna8QSkrjNlzxfDWdVBettdE',
    });
  }

  // 获取所有线上宣讲会
  getAllOnline() {
    this.iService.getOnline().subscribe(res => {
        this.onlineSession = res.data;
    });
  }
  // 获取所有线上宣讲会
  getAllSwiper() {
    this.iService.getSwiper().subscribe(res => {
        this.swiperSession = res.data;
    });
  }
  // 获取所有双选会
  getAllSelect() {
    this.iService.getSelect().subscribe(res => {
        this.selectSession = res.data;
    });
  }
  // 获取所有公司
  getAllCompany() {
    this.iService.getCompany().subscribe(res => {
        this.companySession = res.data;
    });
  }
  // 获取所有实习
  getAllPractice() {
    this.iService.getPractice().subscribe(res => {
        this.practiceSession = res.data;
    });
  }
  // 获取所有职位
  getAllJob() {
    if (!this.jobcompanyId) {
      // 如果没有用公司id获取岗位的话就获取全部岗位
      this.iService.getJob().subscribe(res => {
        this.jobSession = res.data;
      });
    }
  }
  // 获取所有双选会类型
  getAllSelectType() {
    this.iService.getSelectType().subscribe(res => {
        this.selectType = res.data;
    });
  }
  // 挂靠其中一个双选会类型
  doSendType() {
    this.httpClient.post<any>(`/dualSelectType/dualSelects/${this.sendTypeId}/${this.selectId}`, {})
      .subscribe(res => {
        this.message.success('挂靠成功');
      });
  }
  // 挂靠其中一个双选会 公司
  doSendMeeting() {
    this.httpClient.post<any>(`/dualSelect/companies/${this.toMeetingId}/${this.companyId}`, {})
      .subscribe(res => {
        this.message.success('挂靠成功');
      });
  }
  // 挂靠其中一个公司 职位
  doSendCompany() {
    this.httpClient.post<any>(`/company/posts/${this.toCompanyId}/${this.jobId}`, {})
      .subscribe(res => {
        this.message.success('挂靠成功');
      });
  }
  // 删除挂靠 双选会
  doDeleteType() {
    this.httpClient.delete<any>(`/dualSelectType/dualSelects/${this.deleteTypeId}/${this.selectId}`, {})
      .subscribe(res => {
        this.message.success('挂靠删除成功');
      });
}
// 删除挂靠 公司
  doDeleteCompanyTo() {
    this.httpClient.delete<any>(`/dualSelect/companies/${this.deleteMeetingId}/${this.companyId}`, {})
      .subscribe(res => {
        this.message.success('挂靠删除成功');
      });
}
// 删除挂靠 职位
  doDeleteJobTo() {
    this.httpClient.delete<any>(`/company/posts/${this.deleteCompanyId}/${this.jobId}`, {})
      .subscribe(res => {
        this.message.success('挂靠删除成功');
      });
}
  // 删除某个宣讲会
  delectOnline() {
    this.iService.delectOnline(this.delectOnlineId).subscribe(res => {
      this.message.success('宣讲会删除成功');
    });
  }
  // 删除某个双选会
  delectSelect() {
    this.iService.delectSelect(this.delectSelectId).subscribe(res => {
      this.message.success('双选会删除成功');
    });
  }
  // 删除某个公司
  delectCompany() {
    this.iService.delectCompany(this.delectCompanyId).subscribe(res => {
      this.message.success('公司删除成功');
    });
  }
  // 删除某个实习
  delectPractice() {
    this.iService.delectPractice(this.deletePracticeId).subscribe(res => {
      this.message.success('实习删除成功');
    });
  }
  // 删除某个职位
  delectJob() {
    this.iService.delectJob(this.delectJobId).subscribe(res => {
      this.message.success('职位删除成功');
    });
  }
  // 轮播封面上传状态变化
  upLoadSwiperChange(event) {
    this.swiperFileList = event.fileList;
    this.upLoadCloud(this.swiperFileList[this.swiperFileList.length - 1]).then((res: string) => {
      this.swiperFilePath = res;
      this.message.success('轮播封面图片上传成功');

    });
  }
  // 封面上传状态变化
  upLoadChange(event) {
    console.log('文件上传', event.fileList);
    this.fileList = event.fileList;
    this.upLoadCloud(this.fileList[this.fileList.length - 1]).then((res: string) => {
      this.filePath = res;
      this.message.success('封面图片上传成功');

    });
  }
  // ppt图片上传状态
  upLoadChangePpt(event) {
    this.pptFileList = event.fileList;
    this.upLoadCloud(this.pptFileList[this.pptFileList.length - 1]).then((res: string) => {
      this.pptPath = res;
      this.message.success('ppt图片上传成功');
    });
  }
  // 视频上传状态
  upLoadChangeVideo(event) {
    this.videoFileList = event.fileList;
    this.upLoadCloud(this.videoFileList[this.videoFileList.length - 1]).then((res: string) => {
      this.videoPath = res;
      this.message.success('视频上传成功');
    });
  }
  // 图标上传状态 双选会
  upLoadChangeSelectIco(event) {
    this.selectFileList = event.fileList;
    this.upLoadCloud(this.selectFileList[this.selectFileList.length - 1]).then((res: string) => {
      this.selectIco = res;
      this.message.success('双选会图标上传成功');
    });
  }
  // 图标上传状态 公司
  upLoadChangeCompanyIco(event) {
    this.companyFileList = event.fileList;
    this.upLoadCloud(this.companyFileList[this.companyFileList.length - 1]).then((res: string) => {
      this.companyPath = res;
      this.message.success('公司图标上传成功');
    });
  }
  // 图标上传状态 实习
  upLoadChangePracticeIco(event) {
    this.precticeFileList = event.fileList;
    this.upLoadCloud(this.precticeFileList[this.precticeFileList.length - 1]).then((res: string) => {
      this.precticePath = res;
      this.message.success('实习图标上传成功');
    });
  }
// 点击上传新建宣讲会信息
  doInspection() {
    console.log('id', this.onlineId);
    this.httpClient.post<any>('/onlinePresentations/', {
        id: this.onlineId,
        business: this.business,
        companyName: this.companyName,
        cover: this.filePath,
        ppt: this.pptPath,
      videoAddress: this.videoPath,
        deliveryAddress: this.address,
        isWangjiansheng: this.selectedOperator,
        title: this.title,
      exotericIntake: this.text,
      })
        .subscribe(res => {
          console.log('宣讲会新增', res);
          this.message.success('宣讲会新增成功');
        });

  }
  // 点击上传轮播
  doSwiper() {
    this.httpClient.post<any>('/onlinePresentationsBanners/', {
      id: this.swiperId,
        imag: this.swiperFilePath,
      onlinePresentations: {
          id: this.swiperonlineId
      },
      weight: 0
      })
        .subscribe(res => {
          console.log('轮播新增', res);
          this.message.success('轮播新增成功');

        });

  }
  // 点击上传新增双选会信息
addSelect() {
      this.httpClient.post<any>('/dualSelect/', {
      id: this.selectId,
      address: this.selectAddress,
      startDate: this.selectStartTime,
      icon: this.selectIco,
      interviewLocation: this.selectMeetingAddress,
      intro: this.selectText,
      sponsor: this.selectSponsor,
      expirationDate: this.selectEndTime,
      title: this.selectTitle,
    })
      .subscribe(res => {
        console.log('双选会新增', res);
        this.message.success('双选会新增成功');

      });

}
// 点击上传新增公司信息
addCompany() {
      this.httpClient.post<any>('/company/', {
        address: this.createCompanyAddress,
        business: this.companyBusiness,
        icon: this.companyPath,
        intro: this.companyIntro,
        name: this.createCompanyName,
        scale: this.companyScale,
        id: this.companyId,
    })
      .subscribe(res => {
        this.message.success('公司新增成功');

      });

}
// 点击上传新增职位信息
addJob() {
      this.httpClient.post<any>('/post/', {
        education: this.jobEducation,
        name: this.jobName,
        pay: this.jobPay,
        positionsInformation: this.jobIntro,
        pubdate: this.jobPubTime,
        type: this.jobBusiness,
        id: this.jobId,
    })
      .subscribe(res => {
        this.message.success('职位新增成功');

      });

}
// 点击上传新增职位信息
addPractice() {
      this.httpClient.post<any>('/internship/', {
        title: this.precticeTitle,
        companyName: this.precticeCompany,
        address: this.precticeAddress,
        education: this.precticeEducation,
        expirationDate: this.precticeTime,
        positionsInformation: this.precticeInfo,
        pay: this.precticePay,
        icon: this.precticePath,
        id: this.practiceId,
    })
      .subscribe(res => {
        this.message.success('实习新增成功');

      });

}
// 上传腾讯存储桶
  upLoadCloud(file: any) {
    return new Promise((resolve,reject) => {
      this.cos.putObject({
      Bucket: 'qitianpubred-1300782360', /* 必须 */
      Region: 'ap-chengdu',     /* 存储桶所在地域，必须字段 */
      Key: `img/${file.name}`,              /* 必须 */
      StorageClass: 'STANDARD',
      Body: file.originFileObj, // 上传文件对象
      onProgress(progressData) {
        console.log(JSON.stringify(progressData));
      }
    }, (err, res) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(res);
        resolve(res.Location);
      }
    });
    });
  }

// 修改下拉框值变化时  线上宣讲会
  inputSn(event: any) {
    if (event !== undefined && event !== null) {
      this.httpClient.get(`onlinePresentations/${event}`)
        .subscribe((res: any) => {
          this.selectedOperator = res.data.isWangjiansheng;
          this.title = res.data.title;
          this.business = res.data.business;
          this.companyName = res.data.companyName;
          this.address = res.data.deliveryAddress;
          this.text = res.data.exotericIntake;
          this.filePath = res.data.cover;
          this.pptPath = res.data.ppt;
          this.videoPath = res.data.videoAddress;
        });
    }
  }
  // 修改下拉框值变化时  双选会
  inputSelect(event: any) {
    if (event !== undefined && event !== null) {
      this.httpClient.get(`dualSelect/${event}`)
        .subscribe((res: any) => {
          this.selectStartTime = res.data.startDate;
          this.selectEndTime = res.data.expirationDate;
          this.selectAddress = res.data.address;
          this.selectMeetingAddress = res.data.interviewLocation;
          this.selectSponsor = res.data.sponsor;
          this.selectTitle = res.data.title;
          this.selectText = res.data.intro;
          this.selectIco = res.data.icon;
        });
    }
  }
  // 修改下拉框值变化时  公司
  inputCompany(event: any) {
    if (event !== undefined && event !== null) {
      this.httpClient.get(`company/${event}`)
        .subscribe((res: any) => {
          this.createCompanyName = res.data.name;
          this.companyBusiness = res.data.business;
          this.companyIntro = res.data.intro;
          this.createCompanyAddress = res.data.address;
          this.companyScale = res.data.scale;
          this.companyPath = res.data.icon;
        });
    }
  }
  // 修改下拉框值变化时  岗位
  inputJob(event: any) {
    if (event !== undefined && event !== null) {
      this.httpClient.get(`post/${event}`)
        .subscribe((res: any) => {
          this.jobName = res.data.name;
          this.jobPubTime = res.data.pubdate;
          this.jobEducation = res.data.education;
          this.jobBusiness = res.data.type;
          this.jobIntro = res.data.positionsInformation;
          this.jobPay = res.data.pay;
        });
    }
  }
  // 修改下拉框值变化时  岗位
  inputPractice(event: any) {
    if (event !== undefined && event !== null) {
      this.httpClient.get(`internship/${event}`)
        .subscribe((res: any) => {
          this.precticeTitle = res.data.title;
          this.precticeCompany = res.data.companyName;
          this.precticeAddress = res.data.address;
          this.precticeEducation = res.data.education;
          this.precticeTime = res.data.expirationDate;
          this.precticePay = res.data.pay;
          this.precticeInfo = res.data.positionsInformation;
          this.precticePath = res.data.icon;
        });
    }
  }
  // 通过公司id查旗下职位
  throughCompany(event: any) {
    if (event !== undefined && event !== null) {
      this.httpClient.get(`company/posts/${event}`)
        .subscribe((res: any) => {
          this.jobSession = res.data;
        });
    }
  }
}
